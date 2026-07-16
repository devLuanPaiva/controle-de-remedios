import { createAction, props } from '@ngrx/store';

import { CreateDeliveryRequest, DeliveryFilterParams } from '../models/delivery-api.model';
import { IDelivery, IEligiblePrescription } from '../models/delivery.model';

export const loadDeliveries = createAction(
    '[Deliveries] Load Deliveries',
    props<{ companyId: string; page: number; filter?: DeliveryFilterParams }>(),
);

export const loadDeliveriesSuccess = createAction(
    '[Deliveries] Load Deliveries Success',
    props<{
        deliveries: IDelivery[];
        count: number;
        currentPage: number;
        totalPages: number;
        next: string | null;
        previous: string | null;
    }>(),
);

export const loadDeliveriesFailure = createAction(
    '[Deliveries] Load Deliveries Failure',
    props<{ message: string }>(),
);

export const createDelivery = createAction(
    '[Deliveries] Create Delivery',
    props<{ payload: CreateDeliveryRequest }>(),
);

export const createDeliverySuccess = createAction(
    '[Deliveries] Create Delivery Success',
    props<{ delivery: IDelivery }>(),
);

export const createDeliveryFailure = createAction(
    '[Deliveries] Create Delivery Failure',
    props<{ message: string }>(),
);

export const deliverPrescriptionTotal = createAction(
    '[Deliveries] Deliver Prescription Total',
    props<{ prescriptionId: string }>(),
);

export const deliverPrescriptionTotalSuccess = createAction(
    '[Deliveries] Deliver Prescription Total Success',
    props<{ deliveries: IDelivery[] }>(),
);

export const deliverPrescriptionTotalFailure = createAction(
    '[Deliveries] Deliver Prescription Total Failure',
    props<{ message: string }>(),
);

export const loadEligiblePrescriptions = createAction(
    '[Deliveries] Load Eligible Prescriptions',
    props<{ companyId: string; cpf: string }>(),
);

export const loadEligiblePrescriptionsSuccess = createAction(
    '[Deliveries] Load Eligible Prescriptions Success',
    props<{ prescriptions: IEligiblePrescription[] }>(),
);

export const loadEligiblePrescriptionsFailure = createAction(
    '[Deliveries] Load Eligible Prescriptions Failure',
    props<{ message: string }>(),
);

export const clearEligiblePrescriptions = createAction(
    '[Deliveries] Clear Eligible Prescriptions',
);
