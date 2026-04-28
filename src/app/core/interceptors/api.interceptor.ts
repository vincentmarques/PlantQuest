import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  const outgoing = req.clone({
    setHeaders: { 'Content-Type': 'application/json' },
  });

  return next(outgoing).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        switch (err.status) {
          case 0:
            notifications.error('Pas de connexion réseau.');
            break;
          case 401:
            notifications.error('Clé API invalide ou expirée.');
            break;
          case 429:
            notifications.warning('Trop de requêtes. Réessayez dans un instant.');
            break;
          case 500:
          case 502:
          case 503:
            notifications.error('Le service est temporairement indisponible.');
            break;
          default:
            break;
        }
      }
      return throwError(() => err);
    })
  );
};
