export enum UserRole {
    ADMIN,
    USER,
    MANAGER
}

export const UserRoleLabels: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.USER]: 'Usuário',
    [UserRole.MANAGER]: 'Gerente'
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