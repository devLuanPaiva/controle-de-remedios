import { Routes } from '@angular/router';

export const deliveryRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/delivery-list/delivery-list').then((m) => m.DeliveryList),
        title: 'Entregas',
    },
];
