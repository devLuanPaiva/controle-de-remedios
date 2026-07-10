import { Routes } from '@angular/router';

export const patientRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/patient-list/patient-list').then((m) => m.PatientList),
        title: 'Pacientes',
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./pages/patient-edit/patient-edit').then((m) => m.PatientEdit),
        title: 'Editar paciente',
    },
];
