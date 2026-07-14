import { IMedicine } from './medicine.model';

export interface MedicineApiDto {
    id: string;
    name: string;
    eanCode: string | null;
    imageUrl: string | null;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMedicineRequest {
    name: string;
    eanCode: string;
    imageUrl: string;
    companyId: string;
}

export interface MedicineFilterParams {
    name?: string;
    eanCode?: string;
}

export interface MedicinesPage {
    medicines: IMedicine[];
    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}

export function toMedicine(dto: MedicineApiDto): IMedicine {
    return {
        id: dto.id,
        name: dto.name,
        eanCode: dto.eanCode,
        imageUrl: dto.imageUrl,
        companyId: dto.companyId,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}
