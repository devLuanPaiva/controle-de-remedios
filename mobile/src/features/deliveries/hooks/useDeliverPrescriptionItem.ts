import { useCallback, useState } from "react";

import { deliverPrescriptionItem } from "@/data/services/delivery.service";
import { CreateDeliveryRequest, IDelivery } from "@/data/models/delivery.model";

export function useDeliverPrescriptionItem() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const deliver = useCallback(async (payload: CreateDeliveryRequest): Promise<IDelivery> => {
        try {
            setIsSubmitting(true);
            return await deliverPrescriptionItem(payload);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return { deliver, isSubmitting };
}
