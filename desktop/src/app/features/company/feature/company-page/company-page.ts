import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { AuthSessionService } from '@features/auth/services/auth-session.service';
import { normalizeUserRole, UserRole } from '@features/users/models/user.model';
import { Avatar } from '@shared/ui/avatar/avatar';
import { formatCnpj } from '@shared/utils/cnpj.util';

import * as CompanyActions from '../../store/company.actions';
import {
    selectAllCompanies,
    selectCompaniesError,
    selectCompaniesLoading,
    selectCompaniesMutating,
    selectSelectedCompany,
    selectSelectedCompanyId,
} from '../../store/company.selectors';
import { CompanyAssociationsModal } from '../company-associations-modal/company-associations-modal';
import { CompanyCreateModal } from '../company-create-modal/company-create-modal';
import { CompanySwitcher } from '../../ui/company-switcher/company-switcher';

@Component({
    selector: 'app-company-page',
    imports: [FormField, Avatar, CompanySwitcher, CompanyCreateModal, CompanyAssociationsModal],
    templateUrl: './company-page.html',
    styleUrl: './company-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyPage {
    private readonly store = inject(Store);
    private readonly session = inject(AuthSessionService);

    readonly formatCnpj = formatCnpj;

    readonly companies = this.store.selectSignal(selectAllCompanies);
    readonly loading = this.store.selectSignal(selectCompaniesLoading);
    readonly error = this.store.selectSignal(selectCompaniesError);
    readonly mutating = this.store.selectSignal(selectCompaniesMutating);
    readonly selectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);
    readonly selectedCompany = this.store.selectSignal(selectSelectedCompany);

    readonly isAdmin = computed(() => normalizeUserRole(this.session.user()?.role) === UserRole.ADMIN);

    readonly showCreateModal = signal(false);
    readonly showAssociationsModal = signal(false);

    readonly model = signal({
        name: '',
        imageUrl: '',
        active: true,
    });

    readonly companyForm = form(this.model, (schema) => {
        required(schema.name, { message: 'O nome é obrigatório.' });
        maxLength(schema.name, 120, { message: 'O nome deve ter no máximo 120 caracteres.' });

        maxLength(schema.imageUrl, 255, { message: 'A URL da imagem deve ter no máximo 255 caracteres.' });
    });

    readonly canSubmit = computed(() => this.companyForm().valid() && !this.mutating());

    constructor() {
        effect(() => {
            const company = this.selectedCompany();

            if (company) {
                this.model.set({
                    name: company.name,
                    imageUrl: company.imageUrl ?? '',
                    active: company.active,
                });
            }
        });
    }

    onCompanySelected(companyId: string): void {
        this.store.dispatch(CompanyActions.selectCompany({ companyId }));
    }

    onActiveChange(event: Event): void {
        const active = (event.target as HTMLInputElement).checked;
        this.model.update((current) => ({ ...current, active }));
    }

    onSubmit(event: Event): void {
        event.preventDefault();

        const company = this.selectedCompany();

        if (!company || !this.canSubmit()) {
            this.companyForm().markAsTouched();
            return;
        }

        const value = this.model();

        this.store.dispatch(
            CompanyActions.updateCompany({
                id: company.id,
                payload: {
                    name: value.name,
                    imageUrl: value.imageUrl || undefined,
                    active: value.active,
                },
            }),
        );
    }

    openCreateModal(): void {
        this.showCreateModal.set(true);
    }

    closeCreateModal(): void {
        this.showCreateModal.set(false);
    }

    openAssociationsModal(): void {
        this.showAssociationsModal.set(true);
    }

    closeAssociationsModal(): void {
        this.showAssociationsModal.set(false);
    }
}
