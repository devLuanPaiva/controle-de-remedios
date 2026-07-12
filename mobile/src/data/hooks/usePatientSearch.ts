import { useEffect, useState } from "react";

import { useCompanies } from "@/data/contexts/CompanyContext";
import { searchPatients } from "@/data/services/patient.service";
import { IPatient } from "@/data/models/patient.model";
import { useDebouncedValue } from "@/data/hooks/useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 300;

interface UsePatientSearchResult {
    query: string;
    setQuery: (value: string) => void;
    results: IPatient[];
    isSearching: boolean;
    hasSearched: boolean;
}

export function usePatientSearch(initialQuery = ""): UsePatientSearchResult {
    const { selectedCompany } = useCompanies();
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<IPatient[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

    useEffect(() => {
        const trimmed = debouncedQuery.trim();

        if (!trimmed) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        let cancelled = false;
        setIsSearching(true);

        searchPatients(trimmed, selectedCompany?.id)
            .then((patients) => {
                if (!cancelled) {
                    setResults(patients);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setResults([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsSearching(false);
                    setHasSearched(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [debouncedQuery, selectedCompany?.id]);

    return { query, setQuery, results, isSearching, hasSearched };
}
