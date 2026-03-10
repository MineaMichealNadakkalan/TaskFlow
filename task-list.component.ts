// task-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ITask } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import {
  FilterByPriorityPipe,
  FilterByCategoryPipe,
  FilterByStatusPipe,
  SearchTasksPipe,
  DueDateFormatPipe
} from '../../pipes/task-filter.pipe';
import { HighlightOverdueDirective, HighlightPriorityDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, AsyncPipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatChipsModule, MatDialogModule,
    MatSnackBarModule, MatMenuModule,
    // Custom Pipes
    FilterByPriorityPipe, FilterByCategoryPipe,
    FilterByStatusPipe, SearchTasksPipe, DueDateFormatPipe,
    // Custom Directives
    HighlightOverdueDirective, HighlightPriorityDirective
  ],
  template: `
    <div class="task-list-container">
      <!-- Toolbar -->
      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchQuery" placeholder="Search tasks...">
        </mat-form-field>

        <!-- Status Chips -->
        <mat-chip-listbox [(ngModel)]="statusFilter" class="filter-chips">
          <mat-chip-option value="all">All</mat-chip-option>
          <mat-chip-option value="active">Active</mat-chip-option>
          <mat-chip-option value="completed">Done</mat-chip-option>
          <mat-chip-option value="overdue">Overdue</mat-chip-option>
        </mat-chip-listbox>

        <!-- Priority Filter -->
        <mat-form-field appearance="outline" class="filter-select">
          <mat-label>Priority</mat-label>
          <mat-select [(ngModel)]="priorityFilter">
            <mat-option value="">All</mat-option>
            <mat-option value="high">High</mat-option>
            <mat-option value="medium">Medium</mat-option>
            <mat-option value="low">Low</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> New Task
        </button>
      </div>

      <!-- Loading Indicator -->
      <mat-progress-bar *ngIf="loading$ | async" mode="indeterminate" color="accent"></mat-progress-bar>

      <!-- Task Cards - uses *ngFor directive + custom pipes -->
      <div class="task-grid">
        <mat-card
          *ngFor="let task of tasks$ | async
            | filterByPriority: priorityFilter
            | filterByStatus: statusFilter
            | searchTasks: searchQuery;
          trackBy: trackById"
          class="task-card"
          [appHighlightOverdue]="task"
          [ngClass]="{ 'completed': task.completed, 'priority-high': task.priority === 'high' }"
          (click)="viewDetail(task.id)">

          <mat-card-header>
            <div class="card-title-row">
              <!-- Checkbox -->
              <button mat-icon-button (click)="$event.stopPropagation(); toggleComplete(task)">
                <mat-icon [style.color]="task.completed ? '#3ecf8e' : '#9898b8'">
                  {{ task.completed ? 'check_circle' : 'radio_button_unchecked' }}
                </mat-icon>
              </button>
              <mat-card-title [class.strikethrough]="task.completed">{{ task.title }}</mat-card-title>
            </div>

            <!-- Priority badge -->
            <span class="priority-badge" [ngClass]="'badge-' + task.priority">
              {{ task.priority | uppercase }}
            </span>
          </mat-card-header>

          <mat-card-content>
            <p class="task-description" *ngIf="task.description">{{ task.description }}</p>

            <!-- Metadata row -->
            <div class="task-meta">
              <mat-chip class="cat-chip">{{ task.category }}</mat-chip>
              <span class="due-date" [class.overdue]="isOverdue(task)">
                <mat-icon>event</mat-icon>
                {{ task.dueDate | dueDateFormat: task.completed }}
              </span>
            </div>

            <!-- Progress bar (Angular Material MatProgressBar) -->
            <div class="progress-row" *ngIf="task.progress > 0">
              <span>{{ task.progress }}%</span>
              <mat-progress-bar
                mode="determinate"
                [value]="task.progress"
                [color]="task.progress === 100 ? 'accent' : 'primary'">
              </mat-progress-bar>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="$event.stopPropagation(); editTask(task)">
              <mat-icon>edit</mat-icon> Edit
            </button>
            <button mat-button color="warn" (click)="$event.stopPropagation(); deleteTask(task)">
              <mat-icon>delete</mat-icon> Delete
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty state using *ngIf -->
      <div class="empty-state" *ngIf="(tasks$ | async)?.length === 0">
        <mat-icon>task_alt</mat-icon>
        <h3>No tasks found</h3>
        <p>Create a new task to get started!</p>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> Add First Task
        </button>
      </div>
    </div>
  `,
  styles: [`
    .task-list-container { padding: 24px; }
    .toolbar { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 24px; }
    .search-field { flex: 1; min-width: 200px; }
    .filter-select { width: 130px; }
    .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    .task-card { cursor: pointer; transition: box-shadow 0.2s, transform 0.2s; }
    .task-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.15); transform: translateY(-2px); }
    .task-card.completed { opacity: 0.7; }
    .card-title-row { display: flex; align-items: center; flex: 1; }
    .strikethrough { text-decoration: line-through; opacity: 0.6; }
    .priority-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .badge-high { background: rgba(239,69,101,0.15); color: #ef4565; }
    .badge-medium { background: rgba(232,160,69,0.15); color: #e8a045; }
    .badge-low { background: rgba(62,207,142,0.15); color: #3ecf8e; }
    .task-description { color: rgba(0,0,0,0.6); font-size: 0.875rem; margin-bottom: 12px; }
    .task-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
    .due-date { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: rgba(0,0,0,0.5); }
    .due-date mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .due-date.overdue { color: #ef4565; }
    .progress-row { display: flex; align-items: center; gap: 12px; font-size: 0.8rem; }
    .progress-row mat-progress-bar { flex: 1; }
    .empty-state { text-align: center; padding: 64px 24px; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.3; }
  `]
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks$ = this.taskService.tasks$;
  loading$ = this.taskService.loading$;
  searchQuery = '';
  statusFilter = 'active';
  priorityFilter = '';
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.taskService.getTasks().pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, task: ITask): number { return task.id; }

  isOverdue(task: ITask): boolean {
    return !task.completed && task.dueDate < new Date().toISOString().split('T')[0];
  }

  viewDetail(id: number): void {
    this.router.navigate(['/task', id]);
  }

  openAddDialog(): void {
    const ref = this.dialog.open(TaskFormComponent, { data: {}, width: '540px' });
    ref.afterClosed().subscribe(result => {
      if (result?.success) this.snackBar.open('✅ Task created!', 'Close', { duration: 3000 });
    });
  }

  editTask(task: ITask): void {
    const ref = this.dialog.open(TaskFormComponent, { data: { task }, width: '540px' });
    ref.afterClosed().subscribe(result => {
      if (result?.success) this.snackBar.open('✏️ Task updated!', 'Close', { duration: 3000 });
    });
  }

  toggleComplete(task: ITask): void {
    this.taskService.toggleComplete(task.id).subscribe();
    this.snackBar.open(task.completed ? '🔄 Reopened' : '✅ Completed!', 'Close', { duration: 2000 });
  }

  deleteTask(task: ITask): void {
    if (confirm(`Delete "${task.title}"?`)) {
      this.taskService.deleteTask(task.id).subscribe();
      this.snackBar.open('🗑️ Task deleted', 'Undo', { duration: 4000 });
    }
  }
}
