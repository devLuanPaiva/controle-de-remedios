import { TestBed } from '@angular/core/testing';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthSessionService } from '../services/auth-session.service';

describe('authGuard', () => {
  let session: AuthSessionService;
  let router: Router;
  let authenticatedSpy: ReturnType<typeof vi.spyOn>;
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
      providers: [AuthSessionService],
    });

    session = TestBed.inject(AuthSessionService);
    router = TestBed.inject(Router);

    authenticatedSpy = vi.spyOn(session, 'authenticated');
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    authenticatedSpy.mockRestore();
    navigateSpy.mockRestore();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when user is authenticated', () => {
    authenticatedSpy.mockReturnValue(true);
    const activatedRoute: ActivatedRouteSnapshot = createMockActivatedRouteSnapshot();
    const routerState: RouterStateSnapshot = createMockRouterStateSnapshot();
    const result = executeGuard(activatedRoute, routerState);

    expect(authenticatedSpy).toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should block access when user is not authenticated', () => {
    authenticatedSpy.mockReturnValue(false);
    const activatedRoute: ActivatedRouteSnapshot = createMockActivatedRouteSnapshot();
    const routerState: RouterStateSnapshot = createMockRouterStateSnapshot();

    const result = executeGuard(activatedRoute, routerState);

    expect(authenticatedSpy).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should redirect to /login when user is not authenticated', () => {
    authenticatedSpy.mockReturnValue(false);
    const activatedRoute: ActivatedRouteSnapshot = createMockActivatedRouteSnapshot();
    const routerState: RouterStateSnapshot = createMockRouterStateSnapshot();

    executeGuard(activatedRoute, routerState);

    expect(authenticatedSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });
});
