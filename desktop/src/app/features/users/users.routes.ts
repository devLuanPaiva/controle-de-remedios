import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./feature/user-list/user-list').then((m) => m.UserList),
        title: 'Usuários',
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./feature/user-edit/user-edit').then((m) => m.UserEdit),
        title: 'Editar usuário',
    },
];
