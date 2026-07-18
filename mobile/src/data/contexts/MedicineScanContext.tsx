import {
    PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import { useCompanies } from "@/data/contexts/CompanyContext";
import { uploadImage } from "@/data/services/upload.service";
import { createMedicine, searchMedicineByEan, updateMedicine } from "@/data/services/medicine.service";
import { extractBarcodeValue, extractMedicineName } from "@/data/services/gemini.service";
import { IMedicine } from "@/data/models/medicine.model";

export interface CapturedPhoto {
    localUri: string;
    base64: string;
}

export type LookupState =
    | { status: "idle" }
    | { status: "scanning" }
    | { status: "searching" }
    | { status: "found"; medicine: IMedicine; eanCode: string }
    | { status: "not_found"; eanCode: string }
    | { status: "error"; message: string };

interface UpdateMedicineChanges {
    name?: string;
    newPhoto?: CapturedPhoto;
}

interface MedicineScanContextType {
    lookup: LookupState;
    boxPhoto: CapturedPhoto | null;
    extractedName: string | null;
    isExtractingName: boolean;
    captureAndLookup: (photo: CapturedPhoto) => Promise<LookupState>;
    captureBoxPhoto: (photo: CapturedPhoto) => Promise<void>;
    registerNewMedicine: (name: string) => Promise<IMedicine>;
    updateExistingMedicine: (id: string, changes: UpdateMedicineChanges) => Promise<IMedicine>;
    reset: () => void;
}

const MedicineScanContext = createContext<MedicineScanContextType | null>(null);

function buildImageFileName(): string {
    return `medicamento-${Date.now()}.jpg`;
}

export function MedicineScanProvider({ children }: Readonly<PropsWithChildren>) {
    const { selectedCompany } = useCompanies();
    const [lookup, setLookup] = useState<LookupState>({ status: "idle" });
    const [boxPhoto, setBoxPhoto] = useState<CapturedPhoto | null>(null);
    const [extractedName, setExtractedName] = useState<string | null>(null);
    const [isExtractingName, setIsExtractingName] = useState(false);

    const captureAndLookup = useCallback(async (photo: CapturedPhoto): Promise<LookupState> => {
        if (!selectedCompany) {
            const errorState: LookupState = { status: "error", message: "Selecione uma empresa antes de continuar." };
            setLookup(errorState);
            return errorState;
        }

        setLookup({ status: "scanning" });

        const extraction = await extractBarcodeValue(photo.base64);

        if (extraction.status !== "success") {
            const errorState: LookupState = {
                status: "error",
                message: "Não foi possível ler o código de barras. Tente novamente.",
            };
            setLookup(errorState);
            return errorState;
        }

        setLookup({ status: "searching" });

        try {
            const medicine = await searchMedicineByEan(selectedCompany.id, extraction.eanCode);

            const resultState: LookupState = medicine
                ? { status: "found", medicine, eanCode: extraction.eanCode }
                : { status: "not_found", eanCode: extraction.eanCode };

            setLookup(resultState);
            return resultState;
        } catch {
            const errorState: LookupState = {
                status: "error",
                message: "Não foi possível buscar o medicamento. Tente novamente.",
            };
            setLookup(errorState);
            return errorState;
        }
    }, [selectedCompany]);

    const captureBoxPhoto = useCallback(async (photo: CapturedPhoto) => {
        setBoxPhoto(photo);
        setExtractedName(null);
        setIsExtractingName(true);

        const extraction = await extractMedicineName(photo.base64);

        setExtractedName(extraction.status === "success" ? extraction.name : null);
        setIsExtractingName(false);
    }, []);

    const registerNewMedicine = useCallback(async (name: string): Promise<IMedicine> => {
        if (!selectedCompany) {
            throw new Error("Selecione uma empresa antes de continuar.");
        }

        if (lookup.status !== "not_found" || !boxPhoto) {
            throw new Error("Nenhuma foto de caixa capturada.");
        }

        const imageUrl = await uploadImage(boxPhoto.localUri, buildImageFileName(), "image/jpeg", "MEDICINE", name);

        return createMedicine({ name, eanCode: lookup.eanCode, imageUrl, companyId: selectedCompany.id });
    }, [selectedCompany, lookup, boxPhoto]);

    const updateExistingMedicine = useCallback(
        async (id: string, changes: UpdateMedicineChanges): Promise<IMedicine> => {
            let imageUrl: string | undefined;

            if (changes.newPhoto) {
                imageUrl = await uploadImage(
                    changes.newPhoto.localUri,
                    buildImageFileName(),
                    "image/jpeg",
                    "MEDICINE",
                    changes.name ?? "medicamento",
                );
            }

            const updated = await updateMedicine(id, { name: changes.name, imageUrl });

            setLookup((current) =>
                current.status === "found" && current.medicine.id === id
                    ? { ...current, medicine: updated }
                    : current,
            );

            return updated;
        },
        [],
    );

    const reset = useCallback(() => {
        setLookup({ status: "idle" });
        setBoxPhoto(null);
        setExtractedName(null);
        setIsExtractingName(false);
    }, []);

    const contextValue = useMemo(
        () => ({
            lookup,
            boxPhoto,
            extractedName,
            isExtractingName,
            captureAndLookup,
            captureBoxPhoto,
            registerNewMedicine,
            updateExistingMedicine,
            reset,
        }),
        [
            lookup,
            boxPhoto,
            extractedName,
            isExtractingName,
            captureAndLookup,
            captureBoxPhoto,
            registerNewMedicine,
            updateExistingMedicine,
            reset,
        ],
    );

    return (
        <MedicineScanContext.Provider value={contextValue}>
            {children}
        </MedicineScanContext.Provider>
    );
}

export function useMedicineScan(): MedicineScanContextType {
    const context = useContext(MedicineScanContext);

    if (!context) {
        throw new Error("useMedicineScan deve ser usado dentro de um MedicineScanProvider.");
    }

    return context;
}
