import { UserRole } from "@features/users/models/user.model";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
    role: UserRole;
}
