import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ITask, Task, Priority, Category } from '../models/task.model';

@Injectable({
  providedIn: 'root'  // Dependency Injection - singleton service
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks'; // JSON Server
  private storageKey = 'taskflow_tasks';

  // BehaviorSubject for reactive state management
  private tasksSubject = new BehaviorSubject<ITask[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  // ============================================
  // CRUD Operations using RxJS Observables
  // ============================================

  /** Fetch all tasks (tries API, falls back to localStorage) */
  getTasks(): Observable<ITask[]> {
    this.loadingSubject.next(true);
    return this.http.get<ITask[]>(this.apiUrl).pipe(
      tap(tasks => {
        this.tasksSubject.next(tasks);
        this.saveToStorage(tasks);
        this.loadingSubject.next(false);
      }),
      catchError((err) => {
        // Fallback to localStorage if API unavailable
        const cached = this.getFromStorage();
        this.tasksSubject.next(cached);
        this.loadingSubject.next(false);
        return of(cached);
      })
    );
  }

  /** Get single task by ID */
  getTaskById(id: number): Observable<ITask | undefined> {
    return this.tasks$.pipe(
      map(tasks => tasks.find(t => t.id === id))
    );
  }

  /** Add new task */
  addTask(taskData: Omit<ITask, 'id' | 'createdAt'>): Observable<ITask> {
    const newTask = new Task({
      ...taskData,
      id: this.generateId(),
      createdAt: new Date().toISOString().split('T')[0]
    });

    // Try API first, persist locally
    return this.http.post<ITask>(this.apiUrl, newTask).pipe(
      catchError(() => of(newTask)), // Fallback: local only
      tap(saved => {
        const current = this.tasksSubject.getValue();
        const updated = [...current, saved];
        this.tasksSubject.next(updated);
        this.saveToStorage(updated);
      })
    );
  }

  /** Update existing task */
  updateTask(id: number, changes: Partial<ITask>): Observable<ITask> {
    const current = this.tasksSubject.getValue();
    const idx = current.findIndex(t => t.id === id);
    if (idx === -1) return throwError(() => new Error('Task not found'));

    const updated = { ...current[idx], ...changes, updatedAt: new Date().toISOString() };

    return this.http.put<ITask>(`${this.apiUrl}/${id}`, updated).pipe(
      catchError(() => of(updated)),
      tap(saved => {
        const list = [...current];
        list[idx] = saved;
        this.tasksSubject.next(list);
        this.saveToStorage(list);
      })
    );
  }

  /** Delete task */
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(undefined)),
      tap(() => {
        const updated = this.tasksSubject.getValue().filter(t => t.id !== id);
        this.tasksSubject.next(updated);
        this.saveToStorage(updated);
      })
    );
  }

  /** Toggle completion status */
  toggleComplete(id: number): Observable<ITask> {
    const task = this.tasksSubject.getValue().find(t => t.id === id);
    if (!task) return throwError(() => new Error('Task not found'));
    return this.updateTask(id, {
      completed: !task.completed,
      progress: !task.completed ? 100 : task.progress
    });
  }

  // ============================================
  // Computed / Filtered Observables
  // ============================================

  getTasksByPriority(priority: Priority): Observable<ITask[]> {
    return this.tasks$.pipe(map(tasks => tasks.filter(t => t.priority === priority)));
  }

  getTasksByCategory(category: Category): Observable<ITask[]> {
    return this.tasks$.pipe(map(tasks => tasks.filter(t => t.category === category)));
  }

  getCompletedTasks(): Observable<ITask[]> {
    return this.tasks$.pipe(map(tasks => tasks.filter(t => t.completed)));
  }

  getOverdueTasks(): Observable<ITask[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.tasks$.pipe(
      map(tasks => tasks.filter(t => !t.completed && t.dueDate < today))
    );
  }

  getStats(): Observable<{ total: number; completed: number; active: number; overdue: number; completion: number }> {
    const today = new Date().toISOString().split('T')[0];
    return this.tasks$.pipe(
      map(tasks => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const overdue = tasks.filter(t => !t.completed && t.dueDate < today).length;
        return {
          total,
          completed,
          active: total - completed,
          overdue,
          completion: total ? Math.round((completed / total) * 100) : 0
        };
      })
    );
  }

  // ============================================
  // Local Storage Persistence
  // ============================================

  private saveToStorage(tasks: ITask[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  }

  private getFromStorage(): ITask[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.getDefaultTasks();
    } catch {
      return this.getDefaultTasks();
    }
  }

  private loadFromStorage(): void {
    this.tasksSubject.next(this.getFromStorage());
  }

  private generateId(): number {
    const tasks = this.tasksSubject.getValue();
    return tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  }

  private getDefaultTasks(): ITask[] {
    return [
      { id: 1, title: 'Redesign landing page', description: 'Update hero section with new branding', priority: 'high', category: 'Work', dueDate: '2026-03-20', progress: 75, completed: false, createdAt: '2026-03-01' },
      { id: 2, title: 'Learn Angular Material', description: 'Study and implement MatTable, MatDialog components', priority: 'medium', category: 'Learning', dueDate: '2026-03-25', progress: 40, completed: false, createdAt: '2026-03-02' },
      { id: 3, title: 'Complete Angular project', description: 'Finish implementing all project requirements', priority: 'high', category: 'Work', dueDate: '2026-03-15', progress: 30, completed: false, createdAt: '2026-03-03' },
    ];
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let msg = 'An unknown error occurred';
    if (error.status === 0) msg = 'Network error - check your connection';
    else if (error.status === 404) msg = 'Resource not found';
    else if (error.status === 500) msg = 'Server error';
    console.error('TaskService Error:', msg);
    return throwError(() => new Error(msg));
  }
}
