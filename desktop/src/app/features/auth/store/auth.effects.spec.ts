import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject, of, throwError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ToastService } from '@core/ui/toast/service/toast.service';
import { UserRole } from '@features/users/models/user.model';

import { AuthEffects } from './auth.effects';
import * as AuthActions from './auth.actions';
import { AuthUser } from '../models/auth-user.model';
import { AuthService } from '../services/auth.service';
import { AuthSessionService } from '../services/auth-session.service';
import { GoogleAuthService, GoogleSignInCancelledError } from '../services/google-auth.service';

const mockUser: AuthUser = {
  id: 'user-1',
  name: 'Ana Souza',
  email: 'ana@example.com',
  imageUrl: '',
  role: UserRole.ASSISTANT,
};

describe('AuthEffects - loginWithGoogle$', () => {
  let actions$: Subject<Action>;
  let effects: AuthEffects;
  let googleAuthService: { login: ReturnType<typeof vi.fn> };
  let toast: { show: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    actions$ = new Subject<Action>();
    googleAuthService = { login: vi.fn() };
    toast = { show: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: {} },
        { provide: GoogleAuthService, useValue: googleAuthService },
        { provide: AuthSessionService, useValue: { logout: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ToastService, useValue: toast },
      ],
    });

    effects = TestBed.inject(AuthEffects);
  });

  it('dispatches loginSuccess when the Google flow resolves', () =>
    new Promise<void>((resolve) => {
      googleAuthService.login.mockReturnValue(of({ accessToken: 'a', refreshToken: 'r', user: mockUser }));

      effects.loginWithGoogle$.subscribe((action) => {
        expect(action).toEqual(AuthActions.loginSuccess({ user: mockUser }));
        resolve();
      });

      actions$.next(AuthActions.loginWithGoogle());
    }));

  it('dispatches loginWithGoogleCancelled, without an error toast, when the user cancels the flow', () =>
    new Promise<void>((resolve) => {
      googleAuthService.login.mockReturnValue(throwError(() => new GoogleSignInCancelledError()));

      effects.loginWithGoogle$.subscribe((action) => {
        expect(action).toEqual(AuthActions.loginWithGoogleCancelled());
        expect(toast.show).not.toHaveBeenCalled();
        resolve();
      });

      actions$.next(AuthActions.loginWithGoogle());
    }));

  it('dispatches loginFailure with the extracted message for any other error (e.g. e-mail not registered)', () =>
    new Promise<void>((resolve) => {
      googleAuthService.login.mockReturnValue(throwError(() => new Error('boom')));

      effects.loginWithGoogle$.subscribe((action) => {
        expect(action).toEqual(AuthActions.loginFailure({ message: 'Erro ao entrar com o Google.' }));
        resolve();
      });

      actions$.next(AuthActions.loginWithGoogle());
    }));
});
