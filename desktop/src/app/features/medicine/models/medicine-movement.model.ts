export enum MovementType {
    RECEIVED = 'RECEIVED',
    DELIVERED = 'DELIVERED',
    REQUESTED = 'REQUESTED',
}

export const MovementTypeLabels: Record<MovementType, string> = {
    [MovementType.RECEIVED]: 'Recebido',
    [MovementType.DELIVERED]: 'Entregue',
    [MovementType.REQUESTED]: 'Solicitado',
};

export interface IMedicineMovement {
    id: string;
    medicineId: string;
    medicineName: string;
    prescriptionItemId: string | null;
    quantity: number;
    movementDate: Date | null;
    movementType: MovementType;
    createdAt: Date;
}

export interface IMedicineBalance {
    medicineId: string;
    medicineName: string;
    totalReceived: number;
    totalDelivered: number;
    totalRequested: number;
    availableBalance: number;
    pendingDemand: number;
}
