import { useEffect, useState } from "react";

import { ApiRequestError } from "@/lib/apiFetch";
import { brToIso, formatDateBr, isPastOrPresentBrDate, isValidBrDate } from "@/lib/dateFormat";
import { onlyDigits } from "@/lib/cpf";
import { createPatient, updatePatient } from "@/data/services/patient.service";
import { IPatient } from "@/data/models/patient.model";

export interface PatientFormValues {
    name: string;
    cpf: string;
    birthDate: string;
    contact: string;
    address: string;
}

const EMPTY_VALUES: PatientFormValues = { name: "", cpf: "", birthDate: "", contact: "", address: "" };

function patientToFormValues(patient: IPatient): PatientFormValues {
    return {
        name: patient.name,
        cpf: patient.cpf,
        birthDate: formatDateBr(patient.birthDate),
        contact: patient.contact ?? "",
        address: patient.address ?? "",
    };
}

interface UsePatientFormOptions {
    patient?: IPatient | null;
    companyId?: string;
    onSuccess: (patient: IPatient) => void;
}

export function usePatientForm({ patient, companyId, onSuccess }: UsePatientFormOptions) {
    const [values, setValues] = useState<PatientFormValues>(patient ? patientToFormValues(patient) : EMPTY_VALUES);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formErrorField, setFormErrorField] = useState<string | undefined>(undefined);

    useEffect(() => {
        setValues(patient ? patientToFormValues(patient) : EMPTY_VALUES);
    }, [patient]);

    function setField<K extends keyof PatientFormValues>(field: K, value: PatientFormValues[K]) {
        setValues((current) => ({ ...current, [field]: value }));
    }

    function validate(): string | null {
        if (!values.name.trim()) {
            setFormErrorField("name");
            return "Informe o nome do paciente.";
        }

        if (onlyDigits(values.cpf).length !== 11) {
            setFormErrorField("cpf");
            return "Informe um CPF válido.";
        }

        if (!isValidBrDate(values.birthDate)) {
            setFormErrorField("birthDate");
            return "Informe uma data de nascimento válida.";
        }

        if (!isPastOrPresentBrDate(values.birthDate)) {
            setFormErrorField("birthDate");
            return "A data de nascimento não pode ser futura.";
        }

        setFormErrorField(undefined);
        return null;
    }

    async function submit() {
        if (!patient && !companyId) {
            setFormError("Selecione uma empresa para cadastrar o paciente.");
            return;
        }

        const validationError = validate();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            setFormError(null);
            setIsSubmitting(true);

            const basePayload = {
                name: values.name.trim(),
                cpf: onlyDigits(values.cpf),
                birthDate: brToIso(values.birthDate),
                contact: values.contact.trim() || undefined,
                address: values.address.trim() || undefined,
            };

            const result = patient
                ? await updatePatient(patient.id, basePayload)
                : await createPatient({ ...basePayload, companyId: companyId! });

            onSuccess(result);

            if (!patient) {
                setValues(EMPTY_VALUES);
            }
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setFormError(err.message);
                setFormErrorField(err.field);
            } else {
                setFormError("Não foi possível salvar o paciente.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return { values, setField, isSubmitting, formError, formErrorField, submit };
}
