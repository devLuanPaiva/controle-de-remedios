import { describe, it, expect } from 'vitest';
import { Action } from '@ngrx/store';
import { authReducer } from './auth.reducer';
import * as AuthActions from './auth.actions';
import { AuthState } from './auth.state';
import { AuthUser } from '../models/auth-user.model';
import { UserRole } from '@features/users/models/user.model';

const initialState: AuthState = {
  user: null,
  loading: false,
  authenticated: false,
};

const mockUser: AuthUser = {
  id: 'user-1',
  name: 'Ana Souza',
  email: 'ana@example.com',
  imageUrl: 'https://example.com/avatar.png',
  role: UserRole.ASSISTANT,
};

describe('authReducer', () => {
  it('should return the initial state when state is undefined and the action is unknown', () => {
    const unknownAction: Action = { type: '@@UNKNOWN_ACTION' };

    const result = authReducer(undefined, unknownAction);

    expect(result).toEqual(initialState);
  });

  it('should return the exact same state reference for an unknown action', () => {
    const currentState: AuthState = { user: mockUser, loading: false, authenticated: true };
    const unknownAction: Action = { type: '[Auth] Something Else' };

    const result = authReducer(currentState, unknownAction);

    expect(result).toBe(currentState);
  });

  describe('login action', () => {
    it('should set loading to true while preserving the rest of the state', () => {
      const action = AuthActions.login({ email: 'ana@example.com', password: 'secret' });

      const result = authReducer(initialState, action);

      expect(result).toEqual({ ...initialState, loading: true });
    });

    it('should preserve a previously authenticated user while a new login attempt is in flight', () => {
      const previouslyAuthenticated: AuthState = { user: mockUser, loading: false, authenticated: true };
      const action = AuthActions.login({ email: 'ana@example.com', password: 'secret' });

      const result = authReducer(previouslyAuthenticated, action);

      expect(result).toEqual({ user: mockUser, loading: true, authenticated: true });
    });
  });

  describe('loginSuccess action', () => {
    it('should set the user, stop loading and mark the state as authenticated', () => {
      const loadingState: AuthState = { user: null, loading: true, authenticated: false };
      const action = AuthActions.loginSuccess({ user: mockUser });

      const result = authReducer(loadingState, action);

      expect(result).toEqual({ user: mockUser, loading: false, authenticated: true });
    });

    it('should overwrite a previous user when a different user logs in successfully', () => {
      const otherUser: AuthUser = { ...mockUser, id: 'user-2', name: 'Bruno Lima' };
      const stateWithPreviousUser: AuthState = { user: mockUser, loading: true, authenticated: true };
      const action = AuthActions.loginSuccess({ user: otherUser });

      const result = authReducer(stateWithPreviousUser, action);

      expect(result).toEqual({ user: otherUser, loading: false, authenticated: true });
    });
  });

  describe('loginFailure action', () => {
    it('should stop loading and mark the state as unauthenticated', () => {
      const loadingState: AuthState = { user: null, loading: true, authenticated: false };
      const action = AuthActions.loginFailure({ message: 'Invalid credentials' });

      const result = authReducer(loadingState, action);

      expect(result).toEqual({ user: null, loading: false, authenticated: false });
    });

    it('should keep the stale user object from a previous session even though authenticated becomes false (documents current reducer behavior)', () => {
      const staleAuthenticatedState: AuthState = { user: mockUser, loading: true, authenticated: true };
      const action = AuthActions.loginFailure({ message: 'Session expired, please log in again' });

      const result = authReducer(staleAuthenticatedState, action);

      expect(result).toEqual({ user: mockUser, loading: false, authenticated: false });
    });
  });

  describe('logout action', () => {
    it('should reset the state back to the exact initial state reference regardless of the prior state', () => {
      const fullyAuthenticatedState: AuthState = { user: mockUser, loading: true, authenticated: true };
      const action = AuthActions.logout();

      const result = authReducer(fullyAuthenticatedState, action);

      expect(result).toEqual(initialState);
      expect(result).not.toBe(fullyAuthenticatedState);
    });
  });
});
