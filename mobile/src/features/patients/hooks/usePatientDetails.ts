import { useCallback, useEffect, useState } from "react";

import { getPatientById } from "@/data/services/patient.service";
import { IPatient } from "@/data/models/patient.model";

export function usePatientDetails(id: string | undefined) {
    const [patient, setPatient] = useState<IPatient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!id) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const result = await getPatientById(id);
            setPatient(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar o paciente.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    return { patient, setPatient, isLoading, error, reload: load };
}
