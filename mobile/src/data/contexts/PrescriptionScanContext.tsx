import {
    PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import { uploadImagesSequentially } from "@/data/services/upload.service";
import { ExtractionResult, PrescriptionType, extractPrescriptionData } from "@/data/services/extraction.service";

export interface CapturedPage {
    id: string;
    localUri: string;
    base64: string;
}

interface PrescriptionScanContextType {
    prescriptionType: PrescriptionType | null;
    pages: CapturedPage[];
    isProcessing: boolean;
    uploadProgressLabel: string | null;
    extraction: ExtractionResult | null;
    processError: string | null;
    setPrescriptionType: (type: PrescriptionType) => void;
    addPage: (page: CapturedPage) => void;
    removePage: (id: string) => void;
    reset: () => void;
    processAndContinue: () => Promise<boolean>;
    uploadPages: () => Promise<string[] | null>;
}

const PrescriptionScanContext = createContext<PrescriptionScanContextType | null>(null);

export function PrescriptionScanProvider({ children }: Readonly<PropsWithChildren>) {
    const [prescriptionType, setPrescriptionType] = useState<PrescriptionType | null>(null);
    const [pages, setPages] = useState<CapturedPage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgressLabel, setUploadProgressLabel] = useState<string | null>(null);
    const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
    const [processError, setProcessError] = useState<string | null>(null);

    const addPage = useCallback((page: CapturedPage) => {
        setPages((current) => [...current, page]);
    }, []);

    const removePage = useCallback((id: string) => {
        setPages((current) => current.filter((page) => page.id !== id));
    }, []);

    const reset = useCallback(() => {
        setPrescriptionType(null);
        setPages([]);
        setIsProcessing(false);
        setUploadProgressLabel(null);
        setExtraction(null);
        setProcessError(null);
    }, []);

    const processAndContinue = useCallback(async (): Promise<boolean> => {
        if (!prescriptionType || pages.length === 0) {
            setProcessError("Selecione o tipo de receita e tire ao menos uma foto.");
            return false;
        }

        setIsProcessing(true);
        setProcessError(null);

        const extractionResult = await extractPrescriptionData(
            pages.map((page) => ({ base64: page.base64 })),
            prescriptionType,
        );

        setIsProcessing(false);
        setExtraction(extractionResult);

        return true;
    }, [prescriptionType, pages]);

    const uploadPages = useCallback(async (): Promise<string[] | null> => {
        if (pages.length === 0) {
            return null;
        }

        setUploadProgressLabel(`Enviando imagem 1 de ${pages.length}...`);

        try {
            const uploadedImageUrls = await uploadImagesSequentially(
                pages.map((page) => page.localUri),
                "PRESCRIPTION",
                (completed, total) => setUploadProgressLabel(`Enviando imagem ${completed} de ${total}...`),
            );

            return uploadedImageUrls;
        } catch {
            return null;
        } finally {
            setUploadProgressLabel(null);
        }
    }, [pages]);

    const contextValue = useMemo(
        () => ({
            prescriptionType,
            pages,
            isProcessing,
            uploadProgressLabel,
            extraction,
            processError,
            setPrescriptionType,
            addPage,
            removePage,
            reset,
            processAndContinue,
            uploadPages,
        }),
        [
            prescriptionType,
            pages,
            isProcessing,
            uploadProgressLabel,
            extraction,
            processError,
            addPage,
            removePage,
            reset,
            processAndContinue,
            uploadPages,
        ],
    );

    return (
        <PrescriptionScanContext.Provider value={contextValue}>
            {children}
        </PrescriptionScanContext.Provider>
    );
}

export function usePrescriptionScan(): PrescriptionScanContextType {
    const context = useContext(PrescriptionScanContext);

    if (!context) {
        throw new Error("usePrescriptionScan deve ser usado dentro de um PrescriptionScanProvider.");
    }

    return context;
}
