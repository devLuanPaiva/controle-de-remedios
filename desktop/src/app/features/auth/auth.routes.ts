import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const authRoutes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login),
        title: 'Entrar',
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
        canActivate: [authGuard],
        title: 'Início',
    },
];
