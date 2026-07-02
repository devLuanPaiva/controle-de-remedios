import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "login" },
  {
    path: "",
    loadChildren: () => import("@features/auth/auth.routes").then(m => m.authRoutes),
  },
  { path: "**", redirectTo: "login" },
];
