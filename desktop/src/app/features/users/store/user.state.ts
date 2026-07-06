import { IUser } from '../models/user.model';

export interface UsersState {
    items: IUser[];

    loading: boolean;
    error: string | null;
    mutating: boolean;

    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;

    selectedUser: IUser | null;
    selectedUserLoading: boolean;
}
