import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { UserRole } from '@features/users/models/user.model';

export const authRoutes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login),
        title: 'Entrar',
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('@layouts/shell/shell').then((m) => m.Shell),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/home/home').then(m => m.Home),
                title: 'Início',
            },
            {
                path: 'users',
                canActivate: [roleGuard([UserRole.ADMIN, UserRole.MANAGER])],
                loadChildren: () => import('@features/users/users.routes').then((m) => m.usersRoutes),
            },
        ],
    },
];
