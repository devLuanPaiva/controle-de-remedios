import { Routes } from '@angular/router';

export const patientRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./feature/patient-list/patient-list').then((m) => m.PatientList),
        title: 'Pacientes',
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./feature/patient-edit/patient-edit').then((m) => m.PatientEdit),
        title: 'Editar paciente',
    },
];
