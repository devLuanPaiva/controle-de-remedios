export enum UserRole {
    ADMIN,
    ASSISTANT,
    MANAGER,
    PATIENT
}

export const UserRoleLabels: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.ASSISTANT]: 'Assistente',
    [UserRole.MANAGER]: 'Gerente',
    [UserRole.PATIENT]: 'Paciente'
};

export interface IUser {
    id: string
    name: string;
    email: string
    password?: string
    imageUrl?: string
    cpf: string
    role: UserRole
    createdAt: Date
    updatedAt: Date
}


export function normalizeUserRole(raw: unknown): UserRole | null {
    if (typeof raw === 'number' && raw in UserRole) {
        return raw;
    }

    if (typeof raw === 'string' && raw in UserRole) {
        return UserRole[raw as keyof typeof UserRole];
    }

    return null;
}

export function getManageableRoles(currentUserRole: UserRole | null | undefined): UserRole[] {
    switch (currentUserRole) {
        case UserRole.ADMIN:
            return [UserRole.MANAGER, UserRole.ASSISTANT, UserRole.PATIENT];
        case UserRole.MANAGER:
            return [UserRole.ASSISTANT, UserRole.PATIENT];
        default:
            return [];
    }
}