// task-form.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ITask } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatSliderModule, MatIconModule
  ],
  template: `
    <div class="task-form-dialog">
      <mat-dialog-content>
        <h2 mat-dialog-title class="dialog-title">
          <mat-icon>{{ isEdit ? 'edit' : 'add_task' }}</mat-icon>
          {{ isEdit ? 'Edit Task' : 'New Task' }}
        </h2>

        <!-- REACTIVE FORM -->
        <form [formGroup]="taskForm" class="task-form">

          <!-- Title -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Task Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter task title..." maxlength="100">
            <mat-hint align="end">{{ taskForm.get('title')?.value?.length || 0 }}/100</mat-hint>
            <mat-error *ngIf="taskForm.get('title')?.hasError('required')">Title is required</mat-error>
            <mat-error *ngIf="taskForm.get('title')?.hasError('minlength')">Minimum 3 characters</mat-error>
            <mat-error *ngIf="taskForm.get('title')?.hasError('maxlength')">Maximum 100 characters</mat-error>
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Optional description..." maxlength="500"></textarea>
            <mat-hint align="end">{{ taskForm.get('description')?.value?.length || 0 }}/500</mat-hint>
          </mat-form-field>

          <div class="form-row">
            <!-- Priority -->
            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="high">🔴 High</mat-option>
                <mat-option value="medium">🟡 Medium</mat-option>
                <mat-option value="low">🟢 Low</mat-option>
              </mat-select>
              <mat-error *ngIf="taskForm.get('priority')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <!-- Category -->
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="Work">💼 Work</mat-option>
                <mat-option value="Personal">👤 Personal</mat-option>
                <mat-option value="Learning">📚 Learning</mat-option>
                <mat-option value="Health">❤️ Health</mat-option>
              </mat-select>
              <mat-error *ngIf="taskForm.get('category')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>

          <!-- Due Date -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Due Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dueDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="taskForm.get('dueDate')?.hasError('required')">Due date is required</mat-error>
            <mat-error *ngIf="taskForm.get('dueDate')?.hasError('pastDate')">Date cannot be in the past</mat-error>
          </mat-form-field>

          <!-- Progress Slider -->
          <div class="progress-section">
            <label class="slider-label">Progress: <strong>{{ taskForm.get('progress')?.value }}%</strong></label>
            <mat-slider min="0" max="100" step="5" class="full-width">
              <input matSliderThumb formControlName="progress">
            </mat-slider>
          </div>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="taskForm.invalid">
          <mat-icon>save</mat-icon>
          {{ isEdit ? 'Update' : 'Create' }} Task
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .task-form-dialog { min-width: 480px; }
    .dialog-title { display: flex; align-items: center; gap: 8px; font-size: 1.2rem; }
    .task-form { display: flex; flex-direction: column; gap: 8px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; }
    .progress-section { padding: 8px 0; }
    .slider-label { font-size: 0.85rem; color: rgba(0,0,0,0.6); }
    mat-slider { width: 100%; }
  `]
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    public dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: ITask }
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data?.task;
    this.initForm();
    if (this.isEdit && this.data.task) {
      this.taskForm.patchValue(this.data.task);
    }
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      priority: ['medium', Validators.required],
      category: ['Work', Validators.required],
      dueDate: ['', [Validators.required, this.futureDateValidator]],
      progress: [0]
    });
  }

  // Custom validator: date must not be in the past
  private futureDateValidator(control: any) {
    if (!control.value) return null;
    const selected = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today ? { pastDate: true } : null;
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;
    const taskData = {
      ...formValue,
      dueDate: new Date(formValue.dueDate).toISOString().split('T')[0],
      completed: formValue.progress === 100
    };

    if (this.isEdit && this.data.task) {
      this.taskService.updateTask(this.data.task.id, taskData).subscribe(() => {
        this.dialogRef.close({ success: true, action: 'updated' });
      });
    } else {
      this.taskService.addTask(taskData).subscribe(() => {
        this.dialogRef.close({ success: true, action: 'created' });
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
