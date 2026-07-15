import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { ImageFallback } from '@shared/ui/image-fallback/image-fallback';
import { Pagination } from '@shared/ui/pagination/pagination';

import { MedicineMovementFilterParams } from '../../models/medicine-movement-api.model';
import { MovementType, MovementTypeLabels } from '../../models/medicine-movement.model';
import * as MedicineMovementActions from '../../store/medicine-movement.actions';
import {
    selectAllMedicineMovements,
    selectMedicineBalance,
    selectMedicineBalanceLoading,
    selectMedicineMovementsError,
    selectMedicineMovementsLoading,
    selectMedicineMovementsPagination,
} from '../../store/medicine-movement.selectors';
import * as MedicineActions from '../../store/medicine.actions';
import { selectSelectedMedicine, selectSelectedMedicineLoading } from '../../store/medicine.selectors';

interface MovementFilterForm {
    movementType: MovementType | '';
    startDate: string;
    endDate: string;
}

const EMPTY_FILTER_FORM: MovementFilterForm = {
    movementType: '',
    startDate: '',
    endDate: '',
};

const MOVEMENT_TYPE_BADGE_CLASS: Record<MovementType, string> = {
    [MovementType.RECEIVED]: 'badge-success',
    [MovementType.DELIVERED]: 'badge-primary',
    [MovementType.REQUESTED]: 'badge-warning',
};

@Component({
    selector: 'app-medicine-detail',
    imports: [DatePipe, ImageFallback, Pagination],
    templateUrl: './medicine-detail.html',
    styleUrl: './medicine-detail.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicineDetail implements OnDestroy {
    private readonly store = inject(Store);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly MovementTypeLabels = MovementTypeLabels;
    readonly MovementTypeBadgeClass = MOVEMENT_TYPE_BADGE_CLASS;
    readonly movementTypeOptions = Object.values(MovementType);

    readonly medicineId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
        requireSync: true,
    });

    readonly medicine = this.store.selectSignal(selectSelectedMedicine);
    readonly medicineLoading = this.store.selectSignal(selectSelectedMedicineLoading);

    readonly movements = this.store.selectSignal(selectAllMedicineMovements);
    readonly movementsLoading = this.store.selectSignal(selectMedicineMovementsLoading);
    readonly movementsError = this.store.selectSignal(selectMedicineMovementsError);
    readonly movementsPagination = this.store.selectSignal(selectMedicineMovementsPagination);

    readonly balance = this.store.selectSignal(selectMedicineBalance);
    readonly balanceLoading = this.store.selectSignal(selectMedicineBalanceLoading);

    readonly filterForm = signal<MovementFilterForm>({ ...EMPTY_FILTER_FORM });

    private readonly requestedPage = signal(0);

    constructor() {
        effect(() => {
            const id = this.medicineId();

            if (id) {
                this.store.dispatch(MedicineActions.loadMedicineById({ id }));
                this.store.dispatch(MedicineMovementActions.loadMedicineBalance({ medicineId: id }));
                this.requestedPage.set(0);
                this.store.dispatch(MedicineMovementActions.loadMedicineMovements({ medicineId: id, page: 0 }));
            }
        });
    }

    ngOnDestroy(): void {
        this.store.dispatch(MedicineActions.clearSelectedMedicine());
    }

    onFilterTypeChange(rawValue: string): void {
        this.filterForm.update((current) => ({ ...current, movementType: rawValue as MovementType | '' }));
    }

    onFilterStartDateChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, startDate: value }));
    }

    onFilterEndDateChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, endDate: value }));
    }

    applyFilters(event: Event): void {
        event.preventDefault();
        this.loadPage(0);
    }

    clearFilters(): void {
        this.filterForm.set({ ...EMPTY_FILTER_FORM });
        this.loadPage(0);
    }

    retry(): void {
        this.loadPage(this.requestedPage());
    }

    goToPreviousPage(): void {
        if (this.movementsPagination().previous) {
            this.loadPage(this.requestedPage() - 1);
        }
    }

    goToNextPage(): void {
        if (this.movementsPagination().next) {
            this.loadPage(this.requestedPage() + 1);
        }
    }

    goBack(): void {
        this.router.navigate(['/medicines']);
    }

    private loadPage(page: number): void {
        const medicineId = this.medicineId();

        this.requestedPage.set(page);
        this.store.dispatch(
            MedicineMovementActions.loadMedicineMovements({ medicineId, page, filter: this.buildFilter() }),
        );
    }

    private buildFilter(): MedicineMovementFilterParams {
        const form = this.filterForm();

        return {
            movementType: form.movementType || undefined,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
        };
    }
}
