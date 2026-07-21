import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { AuthSessionService } from '@features/auth/services/auth-session.service';
import * as CompanyActions from '@features/company/store/company.actions';
import { selectAllCompanies, selectSelectedCompanyId } from '@features/company/store/company.selectors';
import { CompanySwitcher } from '@features/company/ui/company-switcher/company-switcher';
import { normalizeUserRole, UserRole } from '@features/users/models/user.model';

import { DeliveryQueueWidget } from '../../components/delivery-queue-widget/delivery-queue-widget';
import { DeliveryTimelineWidget } from '../../components/delivery-timeline-widget/delivery-timeline-widget';
import { FulfillmentSummaryWidget } from '../../components/fulfillment-summary-widget/fulfillment-summary-widget';
import { OverdueAvailabilityWidget } from '../../components/overdue-availability-widget/overdue-availability-widget';
import { PrescriptionStatusWidget } from '../../components/prescription-status-widget/prescription-status-widget';
import { UpcomingAvailabilityWidget } from '../../components/upcoming-availability-widget/upcoming-availability-widget';

const STAFF_ROLES = [UserRole.ADMIN, UserRole.MANAGER, UserRole.ASSISTANT];

@Component({
    selector: 'app-dashboard-page',
    imports: [
        CompanySwitcher,
        PrescriptionStatusWidget,
        DeliveryQueueWidget,
        UpcomingAvailabilityWidget,
        OverdueAvailabilityWidget,
        FulfillmentSummaryWidget,
        DeliveryTimelineWidget,
    ],
    templateUrl: './dashboard-page.html',
    styleUrl: './dashboard-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
    private readonly session = inject(AuthSessionService);
    private readonly store = inject(Store);

    readonly user = this.session.user;
    readonly userRole = computed(() => normalizeUserRole(this.user()?.role));
    readonly isStaff = computed(() => {
        const role = this.userRole();
        return role !== null && STAFF_ROLES.includes(role);
    });

    readonly companies = this.store.selectSignal(selectAllCompanies);
    readonly selectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    onCompanySelected(companyId: string): void {
        this.store.dispatch(CompanyActions.selectCompany({ companyId }));
    }
}
