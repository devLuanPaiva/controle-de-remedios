import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
} from "@react-native-google-signin/google-signin";

import { rawFetch } from "@/lib/apiFetch";
import { GOOGLE_WEB_CLIENT_ID } from "@/lib/env";
import { AuthTokens } from "@/data/models/auth.model";

export class GoogleSignInCancelledError extends Error {
    constructor() {
        super("Login com Google cancelado.");
        this.name = "GoogleSignInCancelledError";
    }
}

let isGoogleSignInConfigured = false;

function ensureGoogleSignInConfigured(): void {
    if (isGoogleSignInConfigured) return;

    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
    isGoogleSignInConfigured = true;
}

async function requestGoogleSignIn() {
    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        return await GoogleSignin.signIn();
    } catch (error) {
        if (isErrorWithCode(error)) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                throw new GoogleSignInCancelledError();
            }

            if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                throw new Error("Serviços do Google Play indisponíveis neste dispositivo.");
            }
        }

        throw new Error("Não foi possível entrar com o Google. Tente novamente.");
    }
}

async function obtainGoogleIdToken(): Promise<string> {
    ensureGoogleSignInConfigured();

    const response = await requestGoogleSignIn();

    if (!isSuccessResponse(response)) {
        throw new GoogleSignInCancelledError();
    }

    if (!response.data.idToken) {
        throw new Error("O Google não retornou um token de identidade válido.");
    }

    return response.data.idToken;
}

export async function signInWithGoogle(): Promise<AuthTokens> {
    const idToken = await obtainGoogleIdToken();

    return rawFetch<AuthTokens>("/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
    });
}
