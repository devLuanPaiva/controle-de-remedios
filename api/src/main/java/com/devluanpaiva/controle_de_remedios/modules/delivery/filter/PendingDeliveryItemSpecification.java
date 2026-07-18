package com.devluanpaiva.controle_de_remedios.modules.delivery.filter;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

public final class PendingDeliveryItemSpecification {
    private static final List<PrescriptionStatus> DELIVERABLE_STATUSES = List.of(
            PrescriptionStatus.PENDING, PrescriptionStatus.APPROVED);

    private PendingDeliveryItemSpecification() {
    }

    public static Specification<PrescriptionItem> isDeliverable() {
        return (root, query, builder) -> builder.and(
                root.get("status").in(DELIVERABLE_STATUSES),
                builder.isNull(root.get("delivery")));
    }

    public static Specification<PrescriptionItem> hasCompanyId(UUID companyId) {
        if (companyId == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(
                root.join("prescription").join("patient").join("company").get("id"), companyId);
    }

    public static Specification<PrescriptionItem> hasPatientName(String patientName) {
        if (!StringUtils.hasText(patientName)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.join("prescription").join("patient").get("name")),
                "%" + patientName.toLowerCase() + "%");
    }

    public static Specification<PrescriptionItem> hasPatientCpf(String patientCpf) {
        if (!StringUtils.hasText(patientCpf)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.join("prescription").join("patient").get("cpf")),
                "%" + patientCpf.toLowerCase() + "%");
    }
}
