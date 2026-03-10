# TaskFlow — Angular Task Management App

## Project 4: Task Management and Productivity Tracker
**Framework:** Angular v17+ | **Language:** TypeScript | **UI:** Angular Material

---

## Quick Start

### Prerequisites
- Node.js 18+
- Angular CLI: `npm install -g @angular/cli`

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Start JSON Server (optional - falls back to localStorage)
npx json-server --watch db.json --port 3000

# 3. Start Angular dev server
ng serve

# 4. Open browser
open http://localhost:4200
```

---

## Project Architecture

```
src/app/
├── models/
│   └── task.model.ts          # ITask, IUser, Task class (TypeScript interfaces + classes)
├── services/
│   └── task.service.ts        # TaskService - CRUD with RxJS Observables
├── guards/
│   └── auth.guard.ts          # Route guard (canActivate)
├── interceptors/
│   └── error.interceptor.ts   # HTTP error handling
├── pipes/
│   └── task-filter.pipe.ts    # Custom pipes: filterByPriority, filterByStatus, searchTasks
├── directives/
│   └── highlight.directive.ts # Custom directives: appHighlightOverdue, appHighlightPriority
├── components/
│   ├── navbar/                # Navigation component
│   ├── dashboard/             # Stats & overview
│   ├── task-list/             # All tasks with filtering
│   ├── task-detail/           # Single task view (/task/:id)
│   └── task-form/             # Reactive form (MatDialog)
├── app.routes.ts              # Angular Router config
└── app.component.ts           # Root component + app.config.ts
```

---

## Features Implemented

### 1. TypeScript Essentials
- ✅ `ITask`, `ICategory`, `IUser` interfaces
- ✅ `Task` class with access modifiers (`public`, `private`)
- ✅ Inheritance (`AdminUser implements IUser`)
- ✅ TypeScript generics and utility types

### 2. Angular Components
- ✅ `task-list` — view all tasks with filtering
- ✅ `task-detail` — show/edit specific task
- ✅ `task-form` — add/update task (MatDialog)
- ✅ `navbar` — navigation
- ✅ `*ngFor`, `*ngIf`, `[ngStyle]`, `[ngClass]` directives

### 3. Routing & Navigation
- ✅ Routes: `/dashboard`, `/tasks`, `/task/:id`, `/completed`
- ✅ Route parameters: `/task/:id`
- ✅ Route guards: `authGuard` (canActivate)
- ✅ Lazy loading components

### 4. Services & Dependency Injection
- ✅ `TaskService` with `providedIn: 'root'`
- ✅ CRUD: `addTask()`, `updateTask()`, `deleteTask()`, `toggleComplete()`
- ✅ `HttpClient` with JSON Server fallback to localStorage

### 5. Forms & Validation
- ✅ **Reactive Forms** (`FormBuilder`, `FormGroup`, `Validators`)
- ✅ Built-in validators: `required`, `minLength`, `maxLength`
- ✅ Custom validator: `futureDateValidator`
- ✅ Inline validation messages with `mat-error`

### 6. Custom Pipes
- ✅ `FilterByPriorityPipe` — filter by priority
- ✅ `FilterByCategoryPipe` — filter by category
- ✅ `FilterByStatusPipe` — active/completed/overdue
- ✅ `SearchTasksPipe` — full-text search
- ✅ `DueDateFormatPipe` — format + overdue indicator

### 7. Custom Directives
- ✅ `HighlightOverdueDirective` — red border for overdue tasks
- ✅ `HighlightPriorityDirective` — background color by priority

### 8. Angular Material UI
- ✅ `MatCard`, `MatButton`, `MatIcon`, `MatDialog`
- ✅ `MatProgressBar`, `MatChips`, `MatSnackBar`
- ✅ `MatTable`, `MatDatepicker`, `MatSlider`
- ✅ Dark/light theme toggle

### 9. RxJS & Async
- ✅ `BehaviorSubject` for reactive state
- ✅ `Observable` for all async operations
- ✅ `AsyncPipe` in templates
- ✅ HTTP interceptor for error handling
- ✅ `takeUntil` for subscription cleanup

---

## Data Persistence

**With JSON Server (recommended):**
```bash
# db.json is auto-created
npx json-server --watch db.json --port 3000
```

**Without JSON Server:**  
App automatically falls back to `localStorage`. All changes persist across browser sessions.

---

## Angular Material Theme

```scss
// styles.scss - Custom theme
@use '@angular/material' as mat;

$primary: mat.define-palette(mat.$indigo-palette);
$accent:  mat.define-palette(mat.$teal-palette);

$light-theme: mat.define-light-theme(($primary, $accent));
$dark-theme:  mat.define-dark-theme(($primary, $accent));

@include mat.all-component-themes($light-theme);
.dark-mode { @include mat.all-component-colors($dark-theme); }
```
