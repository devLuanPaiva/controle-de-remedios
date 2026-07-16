package com.devluanpaiva.controle_de_remedios_test.unit.modules.delivery.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.impl.DeliveryEligibilityServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("DeliveryEligibilityServiceImpl")
class DeliveryEligibilityServiceImplTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    private DeliveryEligibilityServiceImpl deliveryEligibilityService;

    @BeforeEach
    void setUp() {
        deliveryEligibilityService = new DeliveryEligibilityServiceImpl(deliveryRepository);
    }

    private Patient buildPatient() {
        Company company = Company.builder().id(UUID.randomUUID()).build();
        return Patient.builder().id(UUID.randomUUID()).company(company).build();
    }

    private Medicine buildMedicine() {
        return Medicine.builder().id(UUID.randomUUID()).name("Glifage XR").build();
    }

    @Test
    @DisplayName("should allow the request when there is no previous delivery still within its treatment period")
    void shouldAllowWhenNoPreviousDeliveryIsStillActive() {
        Patient patient = buildPatient();
        Medicine medicine = buildMedicine();

        when(deliveryRepository.existsByPatient_IdAndPrescriptionItem_Medicine_IdAndNextAvailableDateAfter(
                patient.getId(), medicine.getId(), LocalDate.now())).thenReturn(false);

        deliveryEligibilityService.assertEligible(patient, medicine);
    }

    @Test
    @DisplayName("should block the request when a previous delivery's treatment period has not ended")
    void shouldBlockWhenPreviousDeliveryIsStillActive() {
        Patient patient = buildPatient();
        Medicine medicine = buildMedicine();
        LocalDate nextAvailableDate = LocalDate.now().plusDays(10);
        Delivery previousDelivery = Delivery.builder().nextAvailableDate(nextAvailableDate).build();

        when(deliveryRepository.existsByPatient_IdAndPrescriptionItem_Medicine_IdAndNextAvailableDateAfter(
                patient.getId(), medicine.getId(), LocalDate.now())).thenReturn(true);
        when(deliveryRepository.findTopByPatient_IdAndPrescriptionItem_Medicine_IdOrderByNextAvailableDateDesc(
                patient.getId(), medicine.getId())).thenReturn(Optional.of(previousDelivery));

        assertThatThrownBy(() -> deliveryEligibilityService.assertEligible(patient, medicine))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(businessException.getCode()).isEqualTo("MEDICINE_STILL_IN_TREATMENT_PERIOD");
                    assertThat(businessException.getDetail())
                            .contains(DateTimeFormatter.ofPattern("dd/MM/yyyy").format(nextAvailableDate))
                            .doesNotContain(nextAvailableDate.toString());
                });
    }
}
