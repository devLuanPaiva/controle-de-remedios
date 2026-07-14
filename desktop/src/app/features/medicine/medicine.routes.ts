import { Routes } from '@angular/router';

export const medicineRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/medicine-list/medicine-list').then((m) => m.MedicineList),
        title: 'Medicamentos',
    },
];
