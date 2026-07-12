import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { COMPANY_STORAGE_KEYS } from "@/lib/storageKeys";
import { getCompanies } from "@/data/services/company.service";
import { ICompany } from "../models/company.model";
import { useAuth } from "./AuthContext";

interface CompanyContextType {
    companies: ICompany[];
    selectedCompany: ICompany | null;
    isLoading: boolean;
    error: string | null;
    selectCompany: (companyId: string) => Promise<void>;
}

export const CompanyContext = createContext<CompanyContextType>({
    companies: [],
    selectedCompany: null,
    isLoading: false,
    error: null,
    selectCompany: async () => { },
});

function resolveSelectedCompanyId(
    companies: ICompany[],
    currentId: string | null,
    storedId: string | null,
): string | null {
    if (currentId && companies.some((company) => company.id === currentId)) {
        return currentId;
    }

    if (storedId && companies.some((company) => company.id === storedId)) {
        return storedId;
    }

    return companies[0]?.id ?? null;
}

export function CompanyProvider({ children }: Readonly<PropsWithChildren>) {
    const { isLoggedIn } = useAuth();
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCompanies = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await getCompanies();
            const storedId = await AsyncStorage.getItem(COMPANY_STORAGE_KEYS.SELECTED);

            setCompanies(result);
            setSelectedCompanyId((currentId) => resolveSelectedCompanyId(result, currentId, storedId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar as empresas.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const resetCompanies = useCallback(() => {
        setCompanies([]);
        setSelectedCompanyId(null);
        setError(null);
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            loadCompanies();
        } else {
            resetCompanies();
        }
    }, [isLoggedIn, loadCompanies, resetCompanies]);

    const selectCompany = useCallback(async (companyId: string) => {
        setSelectedCompanyId(companyId);
        await AsyncStorage.setItem(COMPANY_STORAGE_KEYS.SELECTED, companyId);
    }, []);

    const selectedCompany = useMemo(
        () => companies.find((company) => company.id === selectedCompanyId) ?? null,
        [companies, selectedCompanyId],
    );

    const contextValue = useMemo(
        () => ({ companies, selectedCompany, isLoading, error, selectCompany }),
        [companies, selectedCompany, isLoading, error, selectCompany],
    );

    return <CompanyContext.Provider value={contextValue}>{children}</CompanyContext.Provider>;
}

export default CompanyProvider;
export const useCompanies = () => useContext(CompanyContext);
