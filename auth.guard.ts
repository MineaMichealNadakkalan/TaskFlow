// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser, AdminUser } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Mock: Auto-login for demo
    const mockUser = new AdminUser(1, 'Demo User', 'demo@taskflow.app');
    mockUser.isLoggedIn = true;
    this.currentUserSubject.next(mockUser);
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.getValue()?.isLoggedIn;
  }

  login(email: string, password: string): Observable<IUser> {
    // Mock authentication
    const user = new AdminUser(1, 'Demo User', email);
    user.isLoggedIn = true;
    this.currentUserSubject.next(user);
    return new Observable(obs => { obs.next(user); obs.complete(); });
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }
}

// ============================================
// auth.guard.ts - Route Guard
// ============================================
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    return true;
  }
  // Redirect to login if not authenticated
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
