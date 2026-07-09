import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ICompany } from '../../models/company.model';

@Component({
    selector: 'app-company-switcher',
    template: `
        @if (companies().length > 1) {
            <select
                class="input company-switcher__select"
                aria-label="Trocar de empresa"
                [value]="selectedCompanyId() ?? ''"
                (change)="onCompanyChange($event)"
            >
                @for (company of companies(); track company.id) {
                    <option [value]="company.id">{{ company.name }}</option>
                }
            </select>
        } @else if (singleCompanyName()) {
            <span class="company-switcher__single">{{ singleCompanyName() }}</span>
        }
    `,
    styleUrl: './company-switcher.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanySwitcher {
    readonly companies = input.required<ICompany[]>();
    readonly selectedCompanyId = input<string | null>(null);

    readonly companySelected = output<string>();

    readonly singleCompanyName = computed(() => this.companies()[0]?.name ?? '');

    onCompanyChange(event: Event): void {
        const companyId = (event.target as HTMLSelectElement).value;
        this.companySelected.emit(companyId);
    }
}
