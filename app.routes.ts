// app.routes.ts - Angular Router Configuration
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard | TaskFlow'
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/task-list/task-list.component').then(m => m.TaskListComponent),
    title: 'All Tasks | TaskFlow'
  },
  {
    path: 'task/:id',
    loadComponent: () => import('./components/task-detail/task-detail.component').then(m => m.TaskDetailComponent),
    canActivate: [authGuard],   // Route Guard: requires authentication
    title: 'Task Detail | TaskFlow'
  },
  {
    path: 'completed',
    loadComponent: () => import('./components/task-list/task-list.component').then(m => m.TaskListComponent),
    title: 'Completed | TaskFlow'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
