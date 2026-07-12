import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { PrescriptionStatus, PrescriptionStatusLabels } from '@features/prescription/models/prescription.model';

const STATUS_BADGE_CLASS: Record<PrescriptionStatus, string> = {
    [PrescriptionStatus.PENDING]: 'badge-warning',
    [PrescriptionStatus.APPROVED]: 'badge-success',
    [PrescriptionStatus.REJECTED]: 'badge-danger',
    [PrescriptionStatus.DELIVERED]: 'badge-primary',
    [PrescriptionStatus.PARTIAL_DELIVERED]: 'badge-outline',
};

@Component({
    selector: 'app-prescription-status-badge',
    template: `<span class="badge" [class]="badgeClass()">{{ label() }}</span>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionStatusBadge {
    readonly status = input.required<PrescriptionStatus>();

    readonly label = computed(() => PrescriptionStatusLabels[this.status()]);
    readonly badgeClass = computed(() => STATUS_BADGE_CLASS[this.status()]);
}
