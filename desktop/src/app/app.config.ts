import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection, isDevMode,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "@features/auth/interceptors/auth.interceptor";
import { refreshInterceptor } from "@features/auth/interceptors/refresh.interceptor";
import { provideClientHydration, withEventReplay } from "@angular/platform-browser";
import { authReducer } from "@features/auth/store/auth.reducer";
import { AuthEffects } from "@features/auth/store/auth.effects";
import { usersReducer } from "@features/users/store/user.reducer";
import { UsersEffects } from "@features/users/store/user.effects";
import { companyReducer } from "@features/company/store/company.reducer";
import { CompanyEffects } from "@features/company/store/company.effects";
import { patientReducer } from "@features/patient/store/patient.reducer";
import { PatientEffects } from "@features/patient/store/patient.effects";
import { prescriptionReducer } from "@features/prescription/store/prescription.reducer";
import { PrescriptionEffects } from "@features/prescription/store/prescription.effects";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        refreshInterceptor
      ])
    ),
    provideClientHydration(withEventReplay()),
    provideStore({
      auth: authReducer,
      users: usersReducer,
      company: companyReducer,
      patients: patientReducer,
      prescriptions: prescriptionReducer
    }),
    provideEffects([
      AuthEffects,
      UsersEffects,
      CompanyEffects,
      PatientEffects,
      PrescriptionEffects
    ]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
