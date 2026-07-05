import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AuthSessionService } from '../services/auth-session.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const refreshInterceptor: HttpInterceptorFn =
  (req, next) => {

    const auth =
      inject(AuthService);

    const session =
      inject(AuthSessionService);

    return next(req).pipe(

      catchError(error => {

        if (
          !(error instanceof HttpErrorResponse)
        ) {
          return throwError(() => error);
        }

        if (error.status !== 401) {
          return throwError(() => error);
        }

        const refreshToken =
          session.getRefreshToken();

        if (!refreshToken) {

          session.logout();

          return throwError(() => error);
        }

        return auth.refreshToken().pipe(

          switchMap(response => {

            session.setSession(
              null,
              response.accessToken,
              response.refreshToken
            );

            const retryRequest =
              req.clone({

                setHeaders: {
                  Authorization:
                    `Bearer ${response.accessToken}`
                }

              });

            return next(retryRequest);

          }),

          catchError(refreshError => {

            session.logout();

            return throwError(
              () => refreshError
            );

          })

        );

      })

    );

  };