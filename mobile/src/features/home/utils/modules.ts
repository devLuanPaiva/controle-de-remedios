import { Href } from "expo-router";
import { ScanLine } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

import { UserRole } from "@/data/models/user.model";

export interface ModuleDefinition {
    id: string;
    title: string;
    subtitle: string;
    icon: LucideIcon;
    route: Href;
    allowedRoles: UserRole[];
}

export const HOME_MODULES: ModuleDefinition[] = [
    {
        id: "prescriptions",
        title: "Receituário",
        subtitle: "Escanear receitas com IA",
        icon: ScanLine,
        route: "/(protected)/prescriptions" as Href,
        allowedRoles: [UserRole.MANAGER],
    },
];
