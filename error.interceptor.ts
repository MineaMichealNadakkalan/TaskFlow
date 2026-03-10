// error.interceptor.ts - Angular HTTP Interceptor
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let userMessage = 'Something went wrong.';

      if (error.status === 0) {
        // Network error - JSON Server not running, fall back to localStorage
        console.warn('API unavailable - using local storage fallback');
        userMessage = 'Working offline - changes saved locally';
      } else if (error.status === 401) {
        userMessage = 'Please log in to continue.';
      } else if (error.status === 403) {
        userMessage = 'You do not have permission.';
      } else if (error.status === 404) {
        userMessage = 'Resource not found.';
      } else if (error.status >= 500) {
        userMessage = 'Server error. Please try again.';
      }

      // Don't show error for offline mode
      if (error.status !== 0) {
        console.error(`[HTTP Error ${error.status}] ${userMessage}`, error);
      }

      return throwError(() => ({ ...error, userMessage }));
    })
  );
};
