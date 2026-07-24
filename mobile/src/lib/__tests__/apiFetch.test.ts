import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiFetch, ApiRequestError, rawFetch } from "@/lib/apiFetch";

jest.mock("@/lib/env", () => ({
    BASE_URL: "https://api.example.com",
}));

describe("apiFetch", () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
        global.fetch = jest.fn();
    });

    it("attaches the stored access token as a Bearer header", async () => {
        await AsyncStorage.setItem("@auth:access", "stored-token");
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, message: "ok", count: null, currentPage: null, totalPages: null, next: null, previous: null, data: { id: 1 } }),
        });

        await apiFetch("/patients");

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.example.com/patients",
            expect.objectContaining({
                headers: expect.objectContaining({ Authorization: "Bearer stored-token" }),
            }),
        );
    });

    it("omits the Authorization header when there is no stored token", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, message: "ok", count: null, currentPage: null, totalPages: null, next: null, previous: null, data: null }),
        });

        await apiFetch("/auth/forgot-password", { method: "POST" });

        const [, options] = (global.fetch as jest.Mock).mock.calls[0];
        expect(options.headers.Authorization).toBeUndefined();
    });

    it("returns the envelope's data payload unchanged", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, message: "ok", count: 1, currentPage: 1, totalPages: 1, next: null, previous: null, data: { id: "abc" } }),
        });

        const result = await apiFetch<{ id: string }>("/patients/abc");

        expect(result.data).toEqual({ id: "abc" });
    });

    it("throws an ApiRequestError built from the error envelope when the response is not ok", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({
                status: "error",
                message: "Acesso não autorizado",
                data: null,
                errors: [{ code: "AUTH_EMAIL_NOT_REGISTERED", field: "email", detail: "Não existe uma conta cadastrada com este e-mail." }],
            }),
        });

        await expect(apiFetch("/auth/google")).rejects.toMatchObject({
            message: "Não existe uma conta cadastrada com este e-mail.",
        });
    });

    it("falls back to a generic message when the response body cannot be parsed", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => {
                throw new Error("invalid json");
            },
        });

        await expect(apiFetch("/patients")).rejects.toBeInstanceOf(ApiRequestError);
        await expect(apiFetch("/patients")).rejects.toMatchObject({ message: "Erro na requisição." });
    });
});

describe("rawFetch", () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
        global.fetch = jest.fn();
    });

    it("returns the response body directly, without expecting an envelope", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ accessToken: "access-token", refreshToken: "refresh-token" }),
        });

        const result = await rawFetch<{ accessToken: string; refreshToken: string }>("/auth/google", {
            method: "POST",
            body: JSON.stringify({ idToken: "google-id-token" }),
        });

        expect(result).toEqual({ accessToken: "access-token", refreshToken: "refresh-token" });
    });

    it("throws the same ApiRequestError shape as apiFetch on failure", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({
                status: "error",
                message: "Token do Google inválido",
                data: null,
                errors: [{ code: "AUTH_GOOGLE_TOKEN_INVALID", field: "idToken", detail: "Token inválido ou expirado." }],
            }),
        });

        await expect(rawFetch("/auth/google", { method: "POST" })).rejects.toMatchObject({
            code: "AUTH_GOOGLE_TOKEN_INVALID",
            message: "Token inválido ou expirado.",
        });
    });
});
