import { AuthUser } from "../models/auth-user.model";

export interface AuthState {

    user: AuthUser | null;

    loading: boolean;

    authenticated: boolean;
}