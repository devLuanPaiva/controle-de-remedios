import { describe, it, expect } from 'vitest';
import {
  selectAuthState,
  selectUser,
  selectAuthenticated,
  selectAuthLoading,
} from './auth.selectors';
import { AuthState } from './auth.state';
import { AuthUser } from '../models/auth-user.model';
import { UserRole } from '@features/users/models/user.model';

interface RootState {
  auth: AuthState;
}

const mockUser: AuthUser = {
  id: 'user-1',
  name: 'Ana Souza',
  email: 'ana@example.com',
  imageUrl: 'https://example.com/avatar.png',
  role: UserRole.ASSISTANT,
};

function buildRootState(overrides: Partial<AuthState> = {}): RootState {
  return {
    auth: {
      user: null,
      loading: false,
      authenticated: false,
      ...overrides,
    },
  };
}

describe('Auth Selectors', () => {
  it('selectAuthState should return the auth feature slice from the root state', () => {
    const rootState = buildRootState({ user: mockUser, loading: true, authenticated: true });

    const result = selectAuthState(rootState);

    expect(result).toEqual(rootState.auth);
  });

  const cases: Array<{
    name: string;
    selector: (state: RootState) => unknown;
    overrides: Partial<AuthState>;
    expected: unknown;
  }> = [
    {
      name: 'selectUser returns the current user when logged in',
      selector: selectUser,
      overrides: { user: mockUser },
      expected: mockUser,
    },
    {
      name: 'selectUser returns null when there is no authenticated user',
      selector: selectUser,
      overrides: { user: null },
      expected: null,
    },
    {
      name: 'selectAuthenticated returns true when the state is authenticated',
      selector: selectAuthenticated,
      overrides: { authenticated: true },
      expected: true,
    },
    {
      name: 'selectAuthenticated returns false when the state is not authenticated',
      selector: selectAuthenticated,
      overrides: { authenticated: false },
      expected: false,
    },
    {
      name: 'selectAuthLoading returns true while a login request is in flight',
      selector: selectAuthLoading,
      overrides: { loading: true },
      expected: true,
    },
    {
      name: 'selectAuthLoading returns false when no login request is in flight',
      selector: selectAuthLoading,
      overrides: { loading: false },
      expected: false,
    },
  ];

  it.each(cases)('$name', ({ selector, overrides, expected }) => {
    const rootState = buildRootState(overrides);

    const result = selector(rootState);

    expect(result).toEqual(expected);
  });
});
