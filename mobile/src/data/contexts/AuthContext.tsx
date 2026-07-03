import { useRouter, type Href } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    useState,
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";
import { ApiResponse } from "@/lib/apiFetch";
import { IUser, UserRole } from "../models/user.model";

const KEYS = {
    ACCESS: "@auth:access",
    REFRESH: "@auth:refresh",
} as const;

const SIGN_IN_ROUTE = "/(authentication)/signIn" as Href;
const getCurrentTimeMs = () => Date.now();

interface TokenPayload {
    exp: number;
    id: string;
    email: string;
    name: string;
    type: "access" | "refresh";
    role: UserRole;
    imageUrl: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    isLoadingSession: boolean;
    user: Partial<IUser> | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    isLoadingSession: true,
    user: null,
    login: async () => {},
    logout: async () => {},
});

function decodeJWT(token: string): TokenPayload {
    const base64 = token.split(".")[1].replaceAll("-", "+").replaceAll("_", "/");
    const json = decodeURIComponent(
        atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
    );
    return JSON.parse(json);
}

export function AuthProvider({ children }: Readonly<PropsWithChildren>) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [user, setUser] = useState<Partial<IUser> | null>(null);
    const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const performRefreshRef = useRef<(refreshToken: string) => Promise<void>>(async () => {});
    const router = useRouter();

    const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

    const clearTimer = useCallback(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
    }, []);

    const persistTokens = useCallback(async (access: string, refresh: string) => {
        await AsyncStorage.multiSet([
            [KEYS.ACCESS, access],
            [KEYS.REFRESH, refresh],
        ]);
    }, []);

    const removeTokens = useCallback(async () => {
        await AsyncStorage.multiRemove([KEYS.ACCESS, KEYS.REFRESH]);
    }, []);

    const endSession = useCallback(async () => {
        clearTimer();
        await removeTokens();
        setIsLoggedIn(false);
        setUser(null);
    }, [clearTimer, removeTokens]);

    const scheduleRefresh = useCallback((access: string, refresh: string) => {
        clearTimer();

        const { exp } = decodeJWT(access);
        const msUntilRefresh = exp * 1000 - getCurrentTimeMs() - 60_000;

        refreshTimerRef.current = setTimeout(
            () => performRefreshRef.current(refresh),
            Math.max(msUntilRefresh, 0),
        );
    }, [clearTimer]);

    const startSession = useCallback((access: string, refresh: string) => {
        const payload = decodeJWT(access);

        setUser({
            id: payload.id,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            imageUrl: payload.imageUrl,
        });
        setIsLoggedIn(true);
        scheduleRefresh(access, refresh);
    }, [scheduleRefresh]);

    const performRefresh = useCallback(async (refreshToken: string) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/refresh/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!response.ok) throw new Error("refresh_failed");

            const result = await response.json();

            const newAccess: string = result.data?.access ?? result.access;
            const newRefresh: string =
                result.data?.refresh ?? result.refresh ?? refreshToken;

            await persistTokens(newAccess, newRefresh);
            startSession(newAccess, newRefresh);
        } catch {
            await endSession();
            router.replace(SIGN_IN_ROUTE);
        }
    }, [BASE_URL, endSession, persistTokens, router, startSession]);

    useEffect(() => {
        performRefreshRef.current = performRefresh;
    }, [performRefresh]);

    useEffect(() => {
        async function restore() {
            try {
                const [[, access], [, refresh]] = await AsyncStorage.multiGet([
                    KEYS.ACCESS,
                    KEYS.REFRESH,
                ]);

                if (!access || !refresh) return;

                const { exp } = decodeJWT(access);
                const isExpired = exp * 1000 <= getCurrentTimeMs();

                if (isExpired) {
                    await performRefresh(refresh);
                } else {
                    startSession(access, refresh);
                }
            } catch {
                await endSession();
            } finally {
                setIsLoadingSession(false);
            }
        }

        restore();
        return clearTimer;
    }, [endSession, performRefresh, startSession, clearTimer]);

    const login = useCallback(
        async (email: string, password: string) => {
            const response: ApiResponse<{ access: string; refresh: string }> =
                await fetch(`${BASE_URL}/auth/login/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                }).then((res) => res.json());

            if (response.errors) {
                throw new Error(response.errors.detail || "Erro ao realizar login.");
            }

            const access = response.data?.access;
            const refresh = response.data?.refresh;

            if (!access || !refresh) {
                throw new Error("Resposta inválida do servidor");
            }

            await persistTokens(access, refresh);
            startSession(access, refresh);
        },
        [BASE_URL, persistTokens, startSession],
    );

    const logout = useCallback(async () => {
        await endSession();
        router.replace(SIGN_IN_ROUTE);
    }, [endSession, router]);

    const contextValue = useMemo(
        () => ({ isLoggedIn, isLoadingSession, user, login, logout }),
        [isLoggedIn, isLoadingSession, user, login, logout],
    );
    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
}

export default AuthProvider;
export const useAuth = () => useContext(AuthContext);
