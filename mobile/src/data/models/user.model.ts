export enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    USER = "USER",
    PATIENT = "PATIENT",
}

export const UserRoleLabels: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Administrador",
    [UserRole.MANAGER]: "Gerente",
    [UserRole.USER]: "Usuário",
    [UserRole.PATIENT]: "Paciente",
};

export function normalizeUserRole(rawRole: unknown): UserRole | null {
    if (typeof rawRole === "string" && rawRole in UserRole) {
        return UserRole[rawRole as keyof typeof UserRole];
    }

    return null;
}

export interface IUser {
    id: string;
    name: string;
    email: string;
    password?: string;
    imageUrl?: string;
    cpf: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
