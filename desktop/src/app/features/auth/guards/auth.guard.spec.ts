import { TestBed } from '@angular/core/testing';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;
  let isAuthenticatedSpy: ReturnType<typeof vi.spyOn>;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  const createMockActivatedRouteSnapshot = (): ActivatedRouteSnapshot => {
    return {
      component: undefined,
      url: [],
      params: {},
      queryParams: {},
      fragment: null,
      data: {},
      outlet: 'primary',
      routeConfig: null,
      root: {} as ActivatedRouteSnapshot,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      paramMap: { keys: [], get: () => null, getAll: () => [], has: () => false },
      queryParamMap: { keys: [], get: () => null, getAll: () => [], has: () => false },
      title: undefined,
    } as unknown as ActivatedRouteSnapshot;
  };

  const createMockRouterStateSnapshot = (url: string = '/protected'): RouterStateSnapshot => {
    return {
      url,
    } as RouterStateSnapshot;
  };

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    isAuthenticatedSpy = vi.spyOn(authService, 'isAuthenticated');
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    isAuthenticatedSpy.mockRestore();
    navigateSpy.mockRestore();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when user is authenticated', () => {
    isAuthenticatedSpy.mockReturnValue(true);
    const activatedRoute: ActivatedRouteSnapshot = createMockActivatedRouteSnapshot();
    const routerState: RouterStateSnapshot = createMockRouterStateSnapshot();
    const result = executeGuard(activatedRoute, routerState);

    expect(isAuthenticatedSpy).toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should block access when user is not authenticated', () => {
    isAuthenticatedSpy.mockReturnValue(false);
    const activatedRoute: ActivatedRouteSnapshot = createMockActivatedRouteSnapshot();
    const routerState: RouterStateSnapshot = createMockRouterStateSnapshot();

    const result = executeGuard(activatedRoute, routerState);

    expect(isAuthenticatedSpy).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should redirect to /login when user is not authenticated', () => {
    isAuthenticatedSpy.mockReturnValue(false);
    const activatedRoute: ActivatedRouteSnapshot = createMockActivatedRouteSnapshot();
    const routerState: RouterStateSnapshot = createMockRouterStateSnapshot();

    executeGuard(activatedRoute, routerState);

    expect(isAuthenticatedSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });
});
