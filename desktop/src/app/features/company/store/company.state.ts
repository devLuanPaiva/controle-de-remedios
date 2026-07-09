import { IUser } from '@features/users/models/user.model';

import { ICompany } from '../models/company.model';

export interface CompanyState {
    items: ICompany[];

    loading: boolean;
    error: string | null;
    mutating: boolean;

    selectedCompanyId: string | null;

    associatedUsers: IUser[];
    associatedUsersLoading: boolean;
    associatedUsersMutating: boolean;
}
