import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { rawFetch } from "@/lib/apiFetch";
import { GoogleSignInCancelledError, signInWithGoogle } from "@/data/services/googleAuth.service";

jest.mock("@react-native-google-signin/google-signin", () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn().mockResolvedValue(true),
        signIn: jest.fn(),
    },
    isSuccessResponse: (response: { type: string }) => response.type === "success",
    isErrorWithCode: (error: unknown): error is { code: string } =>
        typeof error === "object" && error !== null && typeof (error as { code?: unknown }).code === "string",
    statusCodes: {
        SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
        PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
    },
}));

jest.mock("@/lib/apiFetch", () => ({
    rawFetch: jest.fn(),
}));

jest.mock("@/lib/env", () => ({
    GOOGLE_WEB_CLIENT_ID: "web-client-id.apps.googleusercontent.com",
}));

const mockedSignIn = GoogleSignin.signIn as jest.Mock;
const mockedConfigure = GoogleSignin.configure as jest.Mock;
const mockedRawFetch = rawFetch as jest.Mock;

describe("signInWithGoogle", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("configures GoogleSignin with the web client id and posts the id_token to /auth/google", async () => {
        mockedSignIn.mockResolvedValue({
            type: "success",
            data: { idToken: "google-id-token", user: { email: "luan@example.com" } },
        });
        mockedRawFetch.mockResolvedValue({ accessToken: "access-token", refreshToken: "refresh-token" });

        const tokens = await signInWithGoogle();

        expect(mockedConfigure).toHaveBeenCalledWith({ webClientId: "web-client-id.apps.googleusercontent.com" });
        expect(mockedRawFetch).toHaveBeenCalledWith("/auth/google", {
            method: "POST",
            body: JSON.stringify({ idToken: "google-id-token" }),
        });
        expect(tokens).toEqual({ accessToken: "access-token", refreshToken: "refresh-token" });

        // configuring GoogleSignin is a one-time, idempotent setup: a second call must not repeat it.
        await signInWithGoogle();
        expect(mockedConfigure).toHaveBeenCalledTimes(1);
    });

    it("throws GoogleSignInCancelledError when the user dismisses the Google chooser", async () => {
        mockedSignIn.mockResolvedValue({ type: "cancelled", data: null });

        await expect(signInWithGoogle()).rejects.toBeInstanceOf(GoogleSignInCancelledError);
        expect(mockedRawFetch).not.toHaveBeenCalled();
    });

    it("throws GoogleSignInCancelledError when the native module reports SIGN_IN_CANCELLED", async () => {
        mockedSignIn.mockRejectedValue({ code: "SIGN_IN_CANCELLED" });

        await expect(signInWithGoogle()).rejects.toBeInstanceOf(GoogleSignInCancelledError);
        expect(mockedRawFetch).not.toHaveBeenCalled();
    });

    it("throws a friendly error when Play Services are unavailable", async () => {
        mockedSignIn.mockRejectedValue({ code: "PLAY_SERVICES_NOT_AVAILABLE" });

        await expect(signInWithGoogle()).rejects.toThrow("Serviços do Google Play indisponíveis neste dispositivo.");
    });

    it("throws when Google succeeds but returns no id_token", async () => {
        mockedSignIn.mockResolvedValue({ type: "success", data: { idToken: null, user: {} } });

        await expect(signInWithGoogle()).rejects.toThrow("O Google não retornou um token de identidade válido.");
        expect(mockedRawFetch).not.toHaveBeenCalled();
    });

    it("propagates the API error (e.g. e-mail not registered) from rawFetch", async () => {
        mockedSignIn.mockResolvedValue({
            type: "success",
            data: { idToken: "google-id-token", user: {} },
        });
        mockedRawFetch.mockRejectedValue(new Error("Não existe uma conta cadastrada com este e-mail."));

        await expect(signInWithGoogle()).rejects.toThrow("Não existe uma conta cadastrada com este e-mail.");
    });
});
