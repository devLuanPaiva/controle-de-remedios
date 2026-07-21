import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';

import {
    AvailabilityListApiDto,
    DeliveryQueueSummaryApiDto,
    DeliveryTimelineApiDto,
    FulfillmentSummaryApiDto,
    PrescriptionStatusBreakdownApiDto,
    toAvailabilityList,
    toDeliveryQueueSummary,
    toDeliveryTimeline,
    toFulfillmentSummary,
    toPrescriptionStatusBreakdown,
} from '../models/dashboard-api.model';
import {
    DeliveryTimelineGranularity,
    IAvailabilityList,
    IDeliveryQueueSummary,
    IDeliveryTimeline,
    IFulfillmentSummary,
    IPrescriptionStatusBreakdown,
} from '../models/dashboard.model';

const DEFAULT_UPCOMING_DAYS = 7;

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = signal(environment.api_url);

    getPrescriptionStatusBreakdown(companyId: string): Observable<IPrescriptionStatusBreakdown> {
        return this.http
            .get<ApiResponse<PrescriptionStatusBreakdownApiDto>>(
                `${this.apiUrl()}/dashboard/prescriptions/status-breakdown`,
                { params: { companyId } },
            )
            .pipe(map((response) => toPrescriptionStatusBreakdown(response.data)));
    }

    getQueueSummary(companyId: string): Observable<IDeliveryQueueSummary> {
        return this.http
            .get<ApiResponse<DeliveryQueueSummaryApiDto>>(`${this.apiUrl()}/dashboard/deliveries/queue-summary`, {
                params: { companyId },
            })
            .pipe(map((response) => toDeliveryQueueSummary(response.data)));
    }

    getUpcomingAvailability(companyId: string, days = DEFAULT_UPCOMING_DAYS): Observable<IAvailabilityList> {
        return this.http
            .get<ApiResponse<AvailabilityListApiDto>>(`${this.apiUrl()}/dashboard/deliveries/upcoming-availability`, {
                params: { companyId, days },
            })
            .pipe(map((response) => toAvailabilityList(response.data)));
    }

    getOverdueAvailability(companyId: string): Observable<IAvailabilityList> {
        return this.http
            .get<ApiResponse<AvailabilityListApiDto>>(`${this.apiUrl()}/dashboard/deliveries/overdue-availability`, {
                params: { companyId },
            })
            .pipe(map((response) => toAvailabilityList(response.data)));
    }

    getFulfillmentSummary(companyId: string, from?: string, to?: string): Observable<IFulfillmentSummary> {
        return this.http
            .get<ApiResponse<FulfillmentSummaryApiDto>>(`${this.apiUrl()}/dashboard/deliveries/fulfillment-summary`, {
                params: { companyId, ...(from ? { from } : {}), ...(to ? { to } : {}) },
            })
            .pipe(map((response) => toFulfillmentSummary(response.data)));
    }

    getDeliveryTimeline(
        companyId: string,
        granularity: DeliveryTimelineGranularity = DeliveryTimelineGranularity.DAY,
        from?: string,
        to?: string,
    ): Observable<IDeliveryTimeline> {
        return this.http
            .get<ApiResponse<DeliveryTimelineApiDto>>(`${this.apiUrl()}/dashboard/deliveries/timeline`, {
                params: { companyId, granularity, ...(from ? { from } : {}), ...(to ? { to } : {}) },
            })
            .pipe(map((response) => toDeliveryTimeline(response.data)));
    }
}
