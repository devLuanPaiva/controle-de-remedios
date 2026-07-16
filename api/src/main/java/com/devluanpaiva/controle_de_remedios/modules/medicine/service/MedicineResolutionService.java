package com.devluanpaiva.controle_de_remedios.modules.medicine.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MedicineResolutionService {
    private final MedicineRepository medicineRepository;

    public Medicine resolveOrCreate(Company company, String name, String eanCode, String imageUrl) {
        if (StringUtils.hasText(eanCode)) {
            return resolveByEanCode(company, name, eanCode, imageUrl);
        }

        return resolveByName(company, name, imageUrl);
    }

    private Medicine resolveByEanCode(Company company, String name, String eanCode, String imageUrl) {
        Optional<Medicine> existingByEanCode = medicineRepository.findByCompany_IdAndEanCode(
                company.getId(), eanCode);
        if (existingByEanCode.isPresent()) {
            return existingByEanCode.get();
        }

        Optional<Medicine> similarWithoutEanCode = findSimilarByName(company.getId(), name)
                .filter(medicine -> medicine.getEanCode() == null);
        if (similarWithoutEanCode.isPresent()) {
            Medicine medicine = similarWithoutEanCode.get();
            medicine.setEanCode(eanCode);
            return medicineRepository.save(medicine);
        }

        return createMedicine(company, name, eanCode, imageUrl);
    }

    private Medicine resolveByName(Company company, String name, String imageUrl) {
        Optional<Medicine> similar = findSimilarByName(company.getId(), name);
        if (similar.isPresent()) {
            return similar.get();
        }

        return createMedicine(company, name, null, imageUrl);
    }

    private Medicine createMedicine(Company company, String name, String eanCode, String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            throw new BusinessException(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "Imagem do medicamento obrigatória",
                    "MEDICINE_IMAGE_REQUIRED",
                    "medicine.imageUrl",
                    "Informe a imagem para cadastrar um novo medicamento.");
        }

        return medicineRepository.save(Medicine.builder()
                .name(name)
                .eanCode(eanCode)
                .imageUrl(imageUrl)
                .company(company)
                .build());
    }

    private Optional<Medicine> findSimilarByName(UUID companyId, String name) {
        String anchorWord = MedicineNameMatcher.longestSignificantWord(name);
        if (anchorWord.isEmpty()) {
            return Optional.empty();
        }

        return medicineRepository.findByCompany_IdAndNameContainingIgnoreCase(companyId, anchorWord).stream()
                .filter(medicine -> MedicineNameMatcher.isSimilar(medicine.getName(), name))
                .findFirst();
    }
}
