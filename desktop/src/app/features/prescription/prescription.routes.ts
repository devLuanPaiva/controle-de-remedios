import { Routes } from '@angular/router';

export const prescriptionRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/prescription-list/prescription-list').then((m) => m.PrescriptionList),
        title: 'Receituários',
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./pages/prescription-edit/prescription-edit').then((m) => m.PrescriptionEdit),
        title: 'Editar receituário',
    },
];
