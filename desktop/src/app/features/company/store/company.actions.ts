import { createAction, props } from '@ngrx/store';

import { IUser } from '@features/users/models/user.model';

import { CreateCompanyRequest, UpdateCompanyRequest } from '../models/company-api.model';
import { ICompany } from '../models/company.model';

export const loadCompanies = createAction('[Company] Load Companies');

export const loadCompaniesSuccess = createAction(
    '[Company] Load Companies Success',
    props<{ companies: ICompany[] }>(),
);

export const loadCompaniesFailure = createAction(
    '[Company] Load Companies Failure',
    props<{ message: string }>(),
);

export const selectCompany = createAction(
    '[Company] Select Company',
    props<{ companyId: string }>(),
);

export const createCompany = createAction(
    '[Company] Create Company',
    props<{ payload: CreateCompanyRequest }>(),
);

export const createCompanySuccess = createAction(
    '[Company] Create Company Success',
    props<{ company: ICompany }>(),
);

export const createCompanyFailure = createAction(
    '[Company] Create Company Failure',
    props<{ message: string }>(),
);

export const updateCompany = createAction(
    '[Company] Update Company',
    props<{ id: string; payload: UpdateCompanyRequest }>(),
);

export const updateCompanySuccess = createAction(
    '[Company] Update Company Success',
    props<{ company: ICompany }>(),
);

export const updateCompanyFailure = createAction(
    '[Company] Update Company Failure',
    props<{ message: string }>(),
);

export const loadCompanyUsers = createAction(
    '[Company] Load Company Users',
    props<{ companyId: string }>(),
);

export const loadCompanyUsersSuccess = createAction(
    '[Company] Load Company Users Success',
    props<{ users: IUser[] }>(),
);

export const loadCompanyUsersFailure = createAction(
    '[Company] Load Company Users Failure',
    props<{ message: string }>(),
);

export const associateUser = createAction(
    '[Company] Associate User',
    props<{ companyId: string; userId: string }>(),
);

export const associateUserSuccess = createAction(
    '[Company] Associate User Success',
    props<{ companyId: string }>(),
);

export const associateUserFailure = createAction(
    '[Company] Associate User Failure',
    props<{ message: string }>(),
);

export const removeUser = createAction(
    '[Company] Remove User',
    props<{ companyId: string; userId: string }>(),
);

export const removeUserSuccess = createAction(
    '[Company] Remove User Success',
    props<{ companyId: string }>(),
);

export const removeUserFailure = createAction(
    '[Company] Remove User Failure',
    props<{ message: string }>(),
);

export const clearAssociatedUsers = createAction('[Company] Clear Associated Users');
