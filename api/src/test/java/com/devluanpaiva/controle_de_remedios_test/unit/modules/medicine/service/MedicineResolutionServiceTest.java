package com.devluanpaiva.controle_de_remedios_test.unit.modules.medicine.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine.service.MedicineResolutionService;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("MedicineResolutionService")
class MedicineResolutionServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    private MedicineResolutionService medicineResolutionService;

    @BeforeEach
    void setUp() {
        medicineResolutionService = new MedicineResolutionService(medicineRepository);
    }

    private Company buildCompany() {
        return Company.builder()
                .id(UUID.randomUUID())
                .name("Acme")
                .slug("acme")
                .cnpj("11222333000181")
                .active(true)
                .build();
    }

    private Medicine buildMedicine(Company company, String name, String eanCode) {
        return Medicine.builder()
                .id(UUID.randomUUID())
                .name(name)
                .eanCode(eanCode)
                .imageUrl("https://example.com/medicine.png")
                .company(company)
                .build();
    }

    @Nested
    @DisplayName("resolveOrCreate with eanCode")
    class ResolveOrCreateWithEanCode {

        @Test
        @DisplayName("should return the existing medicine when the eanCode matches exactly and never save")
        void shouldReturnExistingMedicineWhenEanCodeMatchesExactly() {
            Company company = buildCompany();
            Medicine existing = buildMedicine(company, "Dipirona", "7891234567895");

            when(medicineRepository.findByCompany_IdAndEanCode(company.getId(), "7891234567895"))
                    .thenReturn(Optional.of(existing));

            Medicine result = medicineResolutionService.resolveOrCreate(
                    company, "Dipirona", "7891234567895", "https://example.com/dipirona.png");

            assertThat(result).isEqualTo(existing);
            verify(medicineRepository, never()).save(any());
        }

        @Test
        @DisplayName("should backfill the eanCode onto a similarly named medicine that has none")
        void shouldBackfillEanCodeOntoSimilarMedicineWithoutEanCode() {
            Company company = buildCompany();
            Medicine similarWithoutEanCode = buildMedicine(company, "Dipirona", null);

            when(medicineRepository.findByCompany_IdAndEanCode(company.getId(), "7891234567895"))
                    .thenReturn(Optional.empty());
            when(medicineRepository.findByCompany_Id(company.getId())).thenReturn(List.of(similarWithoutEanCode));
            when(medicineRepository.save(similarWithoutEanCode)).thenReturn(similarWithoutEanCode);

            Medicine result = medicineResolutionService.resolveOrCreate(
                    company, "Dipirona", "7891234567895", "https://example.com/dipirona.png");

            assertThat(result).isEqualTo(similarWithoutEanCode);
            assertThat(result.getEanCode()).isEqualTo("7891234567895");
            verify(medicineRepository).save(similarWithoutEanCode);
        }

        @Test
        @DisplayName("should not reuse a similarly named medicine that already has a different eanCode")
        void shouldNotReuseSimilarMedicineThatAlreadyHasADifferentEanCode() {
            Company company = buildCompany();
            Medicine similarWithOtherEanCode = buildMedicine(company, "Dipirona", "1112223334445");

            when(medicineRepository.findByCompany_IdAndEanCode(company.getId(), "7891234567895"))
                    .thenReturn(Optional.empty());
            when(medicineRepository.findByCompany_Id(company.getId())).thenReturn(List.of(similarWithOtherEanCode));
            when(medicineRepository.save(any(Medicine.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Medicine result = medicineResolutionService.resolveOrCreate(
                    company, "Dipirona", "7891234567895", "https://example.com/dipirona.png");

            assertThat(result).isNotEqualTo(similarWithOtherEanCode);
            assertThat(result.getEanCode()).isEqualTo("7891234567895");
            assertThat(similarWithOtherEanCode.getEanCode()).isEqualTo("1112223334445");
        }

        @Test
        @DisplayName("should create a new medicine with the provided eanCode when there is no exact or similar match")
        void shouldCreateNewMedicineWhenNoExactOrSimilarMatchExists() {
            Company company = buildCompany();

            when(medicineRepository.findByCompany_IdAndEanCode(company.getId(), "7891234567895"))
                    .thenReturn(Optional.empty());
            when(medicineRepository.findByCompany_Id(company.getId())).thenReturn(List.of());
            when(medicineRepository.save(any(Medicine.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Medicine result = medicineResolutionService.resolveOrCreate(
                    company, "Dipirona", "7891234567895", "https://example.com/dipirona.png");

            assertThat(result.getName()).isEqualTo("Dipirona");
            assertThat(result.getEanCode()).isEqualTo("7891234567895");
            assertThat(result.getCompany()).isEqualTo(company);
        }
    }

    @Nested
    @DisplayName("resolveOrCreate without eanCode")
    class ResolveOrCreateWithoutEanCode {

        @Test
        @DisplayName("should return a similarly named medicine as-is, even if it already has an eanCode")
        void shouldReturnSimilarMedicineByNameEvenIfItAlreadyHasAnEanCode() {
            Company company = buildCompany();
            Medicine similarWithEanCode = buildMedicine(company, "Dipirona", "7891234567895");

            when(medicineRepository.findByCompany_Id(company.getId())).thenReturn(List.of(similarWithEanCode));

            Medicine result = medicineResolutionService.resolveOrCreate(
                    company, "Dipirona", null, "https://example.com/dipirona.png");

            assertThat(result).isEqualTo(similarWithEanCode);
            assertThat(result.getEanCode()).isEqualTo("7891234567895");
            verify(medicineRepository, never()).save(any());
        }

        @Test
        @DisplayName("should create a new medicine with a null eanCode when no similar name exists")
        void shouldCreateNewMedicineWithNullEanCodeWhenNoSimilarNameExists() {
            Company company = buildCompany();
            Medicine unrelated = buildMedicine(company, "Paracetamol", null);

            when(medicineRepository.findByCompany_Id(company.getId())).thenReturn(List.of(unrelated));
            when(medicineRepository.save(any(Medicine.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Medicine result = medicineResolutionService.resolveOrCreate(
                    company, "Dipirona", null, "https://example.com/dipirona.png");

            assertThat(result.getName()).isEqualTo("Dipirona");
            assertThat(result.getEanCode()).isNull();
        }

        @Test
        @DisplayName("should return the first matching medicine when multiple similar candidates exist")
        void shouldReturnFirstMatchingMedicineWhenMultipleSimilarCandidatesExist() {
            Company company = buildCompany();
            Medicine firstMatch = buildMedicine(company, "Dipirona", null);
            Medicine secondMatch = buildMedicine(company, "Dipirona", null);

            when(medicineRepository.findByCompany_Id(company.getId())).thenReturn(List.of(firstMatch, secondMatch));

            Medicine result = medicineResolutionService.resolveOrCreate(
                    company, "Dipirona", null, "https://example.com/dipirona.png");

            assertThat(result).isEqualTo(firstMatch);
            verify(medicineRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("new medicine creation")
    class NewMedicineCreation {

        @Test
        @DisplayName("should throw when creating a new medicine without an imageUrl")
        void shouldThrowWhenCreatingNewMedicineWithoutImageUrl() {
            Company company = buildCompany();

            when(medicineRepository.findByCompany_Id(company.getId())).thenReturn(List.of());

            assertThatThrownBy(() -> medicineResolutionService.resolveOrCreate(company, "Dipirona", null, "   "))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
                        assertThat(businessException.getCode()).isEqualTo("MEDICINE_IMAGE_REQUIRED");
                    });

            verify(medicineRepository, never()).save(any());
        }

        @Test
        @DisplayName("should persist all provided fields when creating a new medicine")
        void shouldPersistAllProvidedFieldsWhenCreatingNewMedicine() {
            Company company = buildCompany();

            when(medicineRepository.findByCompany_Id(company.getId())).thenReturn(List.of());
            when(medicineRepository.save(any(Medicine.class))).thenAnswer(invocation -> invocation.getArgument(0));

            medicineResolutionService.resolveOrCreate(
                    company, "Dipirona", null, "https://example.com/dipirona.png");

            ArgumentCaptor<Medicine> captor = ArgumentCaptor.forClass(Medicine.class);
            verify(medicineRepository).save(captor.capture());

            Medicine saved = captor.getValue();
            assertThat(saved.getName()).isEqualTo("Dipirona");
            assertThat(saved.getEanCode()).isNull();
            assertThat(saved.getImageUrl()).isEqualTo("https://example.com/dipirona.png");
            assertThat(saved.getCompany()).isEqualTo(company);
        }
    }

    @Nested
    @DisplayName("similarity matching")
    class SimilarityMatching {

        @Test
        @DisplayName("should match a similarly named medicine ignoring case and accents")
        void shouldMatchSimilarNameIgnoringCaseAndAccents() {
            Company company = buildCompany();
            Medicine existing = buildMedicine(company, "Ibuprofeno", null);

            when(medicineRepository.findByCompany_Id(company.getId())).thenReturn(List.of(existing));

            Medicine result = medicineResolutionService.resolveOrCreate(
                    company, "IBUPROFÊNO", null, "https://example.com/ibuprofeno.png");

            assertThat(result).isEqualTo(existing);
            verify(medicineRepository, never()).save(any());
        }
    }
}
