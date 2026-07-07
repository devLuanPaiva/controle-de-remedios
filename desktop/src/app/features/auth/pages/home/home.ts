import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { CompanySwitcher } from '@features/company/ui/company-switcher/company-switcher';
import * as CompanyActions from '@features/company/store/company.actions';
import { selectAllCompanies, selectSelectedCompanyId } from '@features/company/store/company.selectors';

import { AuthSessionService } from '../../services/auth-session.service';

@Component({
    selector: 'app-home',
    imports: [CompanySwitcher],
    templateUrl: './home.html',
    styleUrl: './home.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
    private readonly session = inject(AuthSessionService);
    private readonly store = inject(Store);

    readonly user = this.session.user;

    readonly companies = this.store.selectSignal(selectAllCompanies);
    readonly selectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    onCompanySelected(companyId: string): void {
        this.store.dispatch(CompanyActions.selectCompany({ companyId }));
    }
}
