import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 is handled by authInterceptor (token refresh); don't transform it here
      if (error.status === 401) {
        return throwError(() => error);
      }

      let userMessage = 'An unexpected error occurred.';

      if (error.status === 0) {
        userMessage = 'Cannot connect to the server. Please check your connection.';
      } else if (error.status === 400) {
        userMessage = error.error?.detail ?? 'Invalid request data.';
      } else if (error.status === 404) {
        userMessage = error.error?.detail ?? 'The requested resource was not found.';
      } else if (error.status === 422) {
        userMessage = 'Validation failed. Please check your input.';
      } else if (error.status >= 500) {
        userMessage = 'A server error occurred. Please try again later.';
      }

      console.error(`[HTTP ${error.status}]`, userMessage, error);
      return throwError(() => ({ status: error.status, message: userMessage }));
    })
  );
};
