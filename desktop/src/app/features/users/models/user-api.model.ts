import { IUser, UserRole } from './user.model';

export interface UserApiDto {
    id: string;
    name: string;
    email: string;
    imageUrl: string | null;
    cpf: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    cpf: string;
    imageUrl?: string;
    role: UserRole;
}

export interface UpdateUserRequest {
    name: string;
    cpf: string;
    imageUrl?: string;
}

export interface UsersPage {
    users: IUser[];
    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}
