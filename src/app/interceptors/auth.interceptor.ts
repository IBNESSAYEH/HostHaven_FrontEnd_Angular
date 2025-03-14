import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
   const router = inject(Router);

  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = authService.getToken();
  if (!token) {
    router.navigate(['/auth/login']);
    return throwError(() => new Error('No token found'));
  }

  const cleanToken = token.trim();

  const authReq = req.clone({
    headers: req.headers
      .set('Authorization', `Bearer ${cleanToken}`)
      .set('Content-Type', 'application/json')
  });

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        console.log('Token expired or invalid');
          authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
