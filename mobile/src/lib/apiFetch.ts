import AsyncStorage from "@react-native-async-storage/async-storage";

const base_url = process.env.EXPO_PUBLIC_BASE_URL;

export interface ApiError {
    code: string;
    detail: string;
}

export interface ApiResponse<T> {
    status: "success" | "error";
    message: string;
    data: T | null;
    count: number;
    errors: ApiError | null;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const access = await AsyncStorage.getItem("@auth:access");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as object),
    };

    if (access) headers["Authorization"] = `Bearer ${access}`;

    const response = await fetch(`${base_url}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erro na requisição");
    }

    return response.json();
}
