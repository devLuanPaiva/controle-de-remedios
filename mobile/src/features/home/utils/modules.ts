import { Href } from "expo-router";
import { PillBottle, ScanLine, Truck } from "lucide-react-native";
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
    {
        id: "medicines",
        title: "Medicamentos",
        subtitle: "Cadastrar medicamento com IA",
        icon: PillBottle,
        route: "/(protected)/medicines" as Href,
        allowedRoles: [UserRole.MANAGER, UserRole.ASSISTANT],
    },
    {
        id: "deliveries",
        title: "Entregas",
        subtitle: "Registrar e acompanhar entregas",
        icon: Truck,
        route: "/(protected)/deliveries" as Href,
        allowedRoles: [UserRole.MANAGER, UserRole.ASSISTANT],
    },
];
