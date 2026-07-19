import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    {
        path: '',
        loadChildren: () => import('@features/auth/auth.routes').then((m) => m.authRoutes),
    },
    {
        path: '**',
        loadComponent: () =>
            import('@features/not-found/pages/public-not-found/public-not-found').then((m) => m.PublicNotFound),
        title: 'Página não encontrada',
    },
];
