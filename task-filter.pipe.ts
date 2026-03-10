// ============================================
// Custom Pipes - Filter & Transform Tasks
// ============================================

import { Pipe, PipeTransform } from '@angular/core';
import { ITask, Priority, Category } from '../models/task.model';

/** Filter tasks by priority */
@Pipe({ name: 'filterByPriority', standalone: true, pure: false })
export class FilterByPriorityPipe implements PipeTransform {
  transform(tasks: ITask[], priority: Priority | ''): ITask[] {
    if (!priority) return tasks;
    return tasks.filter(t => t.priority === priority);
  }
}

/** Filter tasks by category */
@Pipe({ name: 'filterByCategory', standalone: true, pure: false })
export class FilterByCategoryPipe implements PipeTransform {
  transform(tasks: ITask[], category: Category | ''): ITask[] {
    if (!category) return tasks;
    return tasks.filter(t => t.category === category);
  }
}

/** Filter tasks by completion status */
@Pipe({ name: 'filterByStatus', standalone: true, pure: false })
export class FilterByStatusPipe implements PipeTransform {
  transform(tasks: ITask[], status: 'all' | 'active' | 'completed' | 'overdue'): ITask[] {
    const today = new Date().toISOString().split('T')[0];
    switch (status) {
      case 'active':    return tasks.filter(t => !t.completed);
      case 'completed': return tasks.filter(t => t.completed);
      case 'overdue':   return tasks.filter(t => !t.completed && t.dueDate < today);
      default:          return tasks;
    }
  }
}

/** Search tasks by title or description */
@Pipe({ name: 'searchTasks', standalone: true, pure: false })
export class SearchTasksPipe implements PipeTransform {
  transform(tasks: ITask[], query: string): ITask[] {
    if (!query?.trim()) return tasks;
    const q = query.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }
}

/** Format due date with overdue indicator */
@Pipe({ name: 'dueDateFormat', standalone: true })
export class DueDateFormatPipe implements PipeTransform {
  transform(dateStr: string, completed = false): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!completed && date < today) return `⚠️ Overdue · ${formatted}`;
    return formatted;
  }
}
