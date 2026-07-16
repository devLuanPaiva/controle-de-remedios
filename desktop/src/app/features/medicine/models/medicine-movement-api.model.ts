import { parseLocalDate } from '@shared/utils/date.util';

import { IMedicineBalance, IMedicineMovement, MovementType } from './medicine-movement.model';

export interface MedicineMovementApiDto {
    id: string;
    medicineId: string;
    medicineName: string;
    prescriptionItemId: string | null;
    quantity: number;
    movementDate: string | null;
    movementType: MovementType;
    createdAt: string;
}

export interface MedicineBalanceApiDto {
    medicineId: string;
    medicineName: string;
    totalReceived: number;
    totalDelivered: number;
    totalRequested: number;
    availableBalance: number;
    pendingDemand: number;
}

export interface MedicineMovementFilterParams {
    movementType?: MovementType;
    startDate?: string;
    endDate?: string;
}

export interface MedicineMovementsPage {
    movements: IMedicineMovement[];
    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}

export function toMedicineMovement(dto: MedicineMovementApiDto): IMedicineMovement {
    return {
        id: dto.id,
        medicineId: dto.medicineId,
        medicineName: dto.medicineName,
        prescriptionItemId: dto.prescriptionItemId,
        quantity: dto.quantity,
        movementDate: dto.movementDate ? parseLocalDate(dto.movementDate) : null,
        movementType: dto.movementType,
        createdAt: new Date(dto.createdAt),
    };
}

export function toMedicineBalance(dto: MedicineBalanceApiDto): IMedicineBalance {
    return { ...dto };
}
