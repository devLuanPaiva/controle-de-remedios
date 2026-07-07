import { IUser, normalizeUserRole, UserRole } from './user.model';

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

export function toUser(dto: UserApiDto): IUser {
    return {
        id: dto.id,
        name: dto.name,
        email: dto.email,
        imageUrl: dto.imageUrl ?? undefined,
        cpf: dto.cpf,
        role: normalizeUserRole(dto.role) ?? UserRole.USER,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}
