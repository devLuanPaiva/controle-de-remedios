export enum UserRole {
    ADMIN = 'ADMIN',
    PREMIUM = 'PREMIUM',
    USER = 'USER'
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}
