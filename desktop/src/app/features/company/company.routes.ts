import { Routes } from '@angular/router';

export const companyRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/company-page/company-page').then((m) => m.CompanyPage),
        title: 'Empresas',
    },
];
