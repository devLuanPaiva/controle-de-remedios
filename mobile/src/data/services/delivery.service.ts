import { apiFetch } from "@/lib/apiFetch";
import { onlyDigits } from "@/lib/cpf";
import { PagedResult } from "@/lib/pagination";
import { UnityType } from "@/data/models/prescription-item.model";
import {
    CreateDeliveryRequest,
    DeliveryFilterParams,
    IDelivery,
    IPendingDeliveryItem,
} from "@/data/models/delivery.model";

const PAGE_SIZE = 20;

interface DeliveryDto {
    id: string;
    companyId: string;
    patientId: string;
    patientName: string;
    prescriptionItemId: string;
    medicineName: string;
    unityType: UnityType;
    deliveryDate: string;
    nextAvailableDate: string;
    deliveryQuantity: number;
    createdAt: string;
    updatedAt: string;
}

interface PendingDeliveryItemDto {
    prescriptionItemId: string;
    prescriptionId: string;
    patientId: string;
    patientName: string;
    issueDate: string;
    medicineName: string;
    unityType: UnityType;
    prescribedQuantity: number;
}

function toDelivery(dto: DeliveryDto): IDelivery {
    return {
        id: dto.id,
        companyId: dto.companyId,
        patientId: dto.patientId,
        patientName: dto.patientName,
        prescriptionItemId: dto.prescriptionItemId,
        medicineName: dto.medicineName,
        unityType: dto.unityType,
        deliveryDate: new Date(dto.deliveryDate),
        nextAvailableDate: new Date(dto.nextAvailableDate),
        deliveryQuantity: dto.deliveryQuantity,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}

function toPendingDeliveryItem(dto: PendingDeliveryItemDto): IPendingDeliveryItem {
    return {
        prescriptionItemId: dto.prescriptionItemId,
        prescriptionId: dto.prescriptionId,
        patientId: dto.patientId,
        patientName: dto.patientName,
        issueDate: new Date(dto.issueDate),
        medicineName: dto.medicineName,
        unityType: dto.unityType,
        prescribedQuantity: dto.prescribedQuantity,
    };
}

function buildFilterParams(companyId: string, page: number, filter?: DeliveryFilterParams): URLSearchParams {
    const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
        companyId,
    });

    const patientName = filter?.patientName?.trim();
    const patientCpf = filter?.patientCpf?.trim();

    if (patientName) {
        params.set("patientName", patientName);
    }

    if (patientCpf) {
        params.set("patientCpf", onlyDigits(patientCpf));
    }

    return params;
}

export async function getDeliveries(
    companyId: string,
    page: number,
    filter?: DeliveryFilterParams,
): Promise<PagedResult<IDelivery>> {
    const params = buildFilterParams(companyId, page, filter);
    const response = await apiFetch<DeliveryDto[]>(`/deliveries?${params.toString()}`);

    return {
        data: response.data.map(toDelivery),
        currentPage: response.currentPage ?? page,
        totalPages: response.totalPages ?? 1,
    };
}

export async function getPendingDeliveryItems(
    companyId: string,
    page: number,
    filter?: DeliveryFilterParams,
): Promise<PagedResult<IPendingDeliveryItem>> {
    const params = buildFilterParams(companyId, page, filter);
    const response = await apiFetch<PendingDeliveryItemDto[]>(`/deliveries/pending-items?${params.toString()}`);

    return {
        data: response.data.map(toPendingDeliveryItem),
        currentPage: response.currentPage ?? page,
        totalPages: response.totalPages ?? 1,
    };
}

export async function deliverPrescriptionItem(payload: CreateDeliveryRequest): Promise<IDelivery> {
    const response = await apiFetch<DeliveryDto>("/deliveries", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return toDelivery(response.data);
}
