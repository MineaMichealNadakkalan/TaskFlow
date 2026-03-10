// ============================================
// Task Data Models - TypeScript Interfaces & Classes
// ============================================

export type Priority = 'high' | 'medium' | 'low';
export type Category = 'Work' | 'Personal' | 'Learning' | 'Health';
export type TaskStatus = 'active' | 'completed' | 'overdue';

export interface ITask {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  dueDate: string;
  progress: number;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ICategory {
  id: number;
  name: Category;
  color: string;
  icon: string;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isLoggedIn: boolean;
}

// Task Class with access modifiers and methods
export class Task implements ITask {
  public id: number;
  public title: string;
  public description: string;
  public priority: Priority;
  public category: Category;
  public dueDate: string;
  public progress: number;
  public completed: boolean;
  public createdAt: string;
  public updatedAt?: string;

  constructor(data: Partial<ITask>) {
    this.id = data.id ?? 0;
    this.title = data.title ?? '';
    this.description = data.description ?? '';
    this.priority = data.priority ?? 'medium';
    this.category = data.category ?? 'Work';
    this.dueDate = data.dueDate ?? '';
    this.progress = data.progress ?? 0;
    this.completed = data.completed ?? false;
    this.createdAt = data.createdAt ?? new Date().toISOString().split('T')[0];
  }

  get isOverdue(): boolean {
    return !this.completed && this.dueDate < new Date().toISOString().split('T')[0];
  }

  get status(): TaskStatus {
    if (this.completed) return 'completed';
    if (this.isOverdue) return 'overdue';
    return 'active';
  }

  markComplete(): void {
    this.completed = true;
    this.progress = 100;
    this.updatedAt = new Date().toISOString();
  }
}

// User class with inheritance
export class AdminUser implements IUser {
  public id: number;
  public name: string;
  public email: string;
  public role: 'admin' | 'user' = 'admin';
  public isLoggedIn: boolean = false;
  private permissions: string[] = ['create', 'edit', 'delete', 'view'];

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  hasPermission(action: string): boolean {
    return this.permissions.includes(action);
  }
}
