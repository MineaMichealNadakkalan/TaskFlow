// app.component.ts - Root Component
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, CommonModule,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatSidenavModule, MatListModule, MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="app-container">
      <!-- Sidebar Navigation -->
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon>bolt</mat-icon>
          <span class="app-title">TaskFlow</span>
        </div>

        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/tasks" routerLinkActive="active-link">
            <mat-icon matListItemIcon>format_list_bulleted</mat-icon>
            <span matListItemTitle>All Tasks</span>
          </a>
          <a mat-list-item routerLink="/completed" routerLinkActive="active-link">
            <mat-icon matListItemIcon>check_circle_outline</mat-icon>
            <span matListItemTitle>Completed</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main Content with Router Outlet -->
      <mat-sidenav-content>
        <!-- Top Navbar (app-navbar component) -->
        <mat-toolbar color="primary" class="toolbar">
          <span class="toolbar-spacer"></span>
          <span>TaskFlow Productivity Tracker</span>
          <span class="toolbar-spacer"></span>
          <button mat-icon-button matTooltip="Toggle Theme">
            <mat-icon>light_mode</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Profile">
            <mat-icon>account_circle</mat-icon>
          </button>
        </mat-toolbar>

        <!-- Router Outlet: renders active route component -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-container { height: 100vh; }
    .sidenav { width: 220px; background: #12121a; color: #e8e8f0; padding-top: 16px; }
    .sidenav-header { display: flex; align-items: center; gap: 8px; padding: 16px 24px; font-size: 1.2rem; font-weight: 700; }
    .app-title { background: linear-gradient(135deg, #7c6af7, #3ecf8e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .toolbar { position: sticky; top: 0; z-index: 10; }
    .toolbar-spacer { flex: 1; }
    .main-content { padding: 0; }
    .active-link { background: rgba(124,106,247,0.15) !important; color: #7c6af7 !important; }
  `]
})
export class AppComponent {
  title = 'TaskFlow';
}

// ============================================
// app.config.ts - Application Configuration
// ============================================
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideAnimations(),
  ]
};
