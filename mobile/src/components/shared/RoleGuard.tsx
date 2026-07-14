import { ReactNode, useEffect } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "@/data/contexts/AuthContext";
import { UserRole } from "@/data/models/user.model";

interface RoleGuardProps {
    allow: UserRole[];
    children: ReactNode;
}

export function RoleGuard({ allow, children }: Readonly<RoleGuardProps>) {
    const { user } = useAuth();
    const router = useRouter();
    const isAllowed = Boolean(user?.role && allow.includes(user.role));

    useEffect(() => {
        if (!isAllowed) {
            router.replace("/(protected)/home");
        }
    }, [isAllowed, router]);

    if (!isAllowed) {
        return null;
    }

    return <>{children}</>;
}
