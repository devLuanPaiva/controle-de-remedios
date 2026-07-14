package com.devluanpaiva.controle_de_remedios_test.unit.modules.prescription.filter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.filter.PrescriptionSpecification;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

@DisplayName("PrescriptionSpecification")
class PrescriptionSpecificationTest {

    @Nested
    @DisplayName("associatedWithManager")
    class AssociatedWithManager {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should filter by the manager's user id through the patient, company and users join")
        void shouldFilterByManagerUserIdThroughJoins() {
            UUID managerId = UUID.randomUUID();
            Specification<Prescription> specification = PrescriptionSpecification.associatedWithManager(managerId);

            Root<Prescription> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);
            Join<Prescription, Patient> patientJoin = mock(Join.class);
            Join<Patient, Company> companyJoin = mock(Join.class);
            Join<Company, User> usersJoin = mock(Join.class);
            Path<UUID> idPath = mock(Path.class);
            Predicate predicate = mock(Predicate.class);

            when(root.<Prescription, Patient>join("patient")).thenReturn(patientJoin);
            when(patientJoin.<Patient, Company>join("company")).thenReturn(companyJoin);
            when(companyJoin.<Company, User>join("users")).thenReturn(usersJoin);
            when(usersJoin.<UUID>get("id")).thenReturn(idPath);
            when(builder.equal(idPath, managerId)).thenReturn(predicate);

            Predicate result = specification.toPredicate(root, query, builder);

            assertThat(result).isEqualTo(predicate);
            verify(builder).equal(idPath, managerId);
        }
    }

    @Nested
    @DisplayName("associatedWithPatientUser")
    class AssociatedWithPatientUser {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should filter by the linked user id through the patient and user join")
        void shouldFilterByLinkedUserIdThroughJoins() {
            UUID patientUserId = UUID.randomUUID();
            Specification<Prescription> specification = PrescriptionSpecification.associatedWithPatientUser(patientUserId);

            Root<Prescription> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);
            Join<Prescription, Patient> patientJoin = mock(Join.class);
            Join<Patient, User> userJoin = mock(Join.class);
            Path<UUID> idPath = mock(Path.class);
            Predicate predicate = mock(Predicate.class);

            when(root.<Prescription, Patient>join("patient")).thenReturn(patientJoin);
            when(patientJoin.<Patient, User>join("user")).thenReturn(userJoin);
            when(userJoin.<UUID>get("id")).thenReturn(idPath);
            when(builder.equal(idPath, patientUserId)).thenReturn(predicate);

            Predicate result = specification.toPredicate(root, query, builder);

            assertThat(result).isEqualTo(predicate);
            verify(builder).equal(idPath, patientUserId);
        }
    }

    @Nested
    @DisplayName("hasPatientId")
    class HasPatientId {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should return an unrestricted specification when patientId is null")
        void shouldReturnUnrestrictedSpecificationWhenPatientIdIsNull() {
            Specification<Prescription> specification = PrescriptionSpecification.hasPatientId(null);

            Root<Prescription> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);

            specification.toPredicate(root, query, builder);

            verify(root, never()).get(anyString());
            verify(root, never()).join(anyString());
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should filter by patient id when provided")
        void shouldFilterByPatientIdWhenProvided() {
            UUID patientId = UUID.randomUUID();
            Specification<Prescription> specification = PrescriptionSpecification.hasPatientId(patientId);

            Root<Prescription> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);
            Path<Patient> patientPath = mock(Path.class);
            Path<UUID> idPath = mock(Path.class);
            Predicate predicate = mock(Predicate.class);

            when(root.<Patient>get("patient")).thenReturn(patientPath);
            when(patientPath.<UUID>get("id")).thenReturn(idPath);
            when(builder.equal(idPath, patientId)).thenReturn(predicate);

            Predicate result = specification.toPredicate(root, query, builder);

            assertThat(result).isEqualTo(predicate);
        }
    }

    @Nested
    @DisplayName("hasPatientName")
    class HasPatientName {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should return an unrestricted specification when name is blank")
        void shouldReturnUnrestrictedSpecificationWhenNameIsBlank() {
            Specification<Prescription> specification = PrescriptionSpecification.hasPatientName("   ");

            Root<Prescription> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);

            specification.toPredicate(root, query, builder);

            verify(root, never()).get(anyString());
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should filter case-insensitively with a wildcard pattern when name is provided")
        void shouldFilterCaseInsensitivelyWithWildcardPattern() {
            Specification<Prescription> specification = PrescriptionSpecification.hasPatientName("JoÃo");

            Root<Prescription> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);
            Path<Patient> patientPath = mock(Path.class);
            Path<String> namePath = mock(Path.class);
            Expression<String> lowerName = mock(Expression.class);
            Predicate predicate = mock(Predicate.class);

            when(root.<Patient>get("patient")).thenReturn(patientPath);
            when(patientPath.<String>get("name")).thenReturn(namePath);
            when(builder.lower(namePath)).thenReturn(lowerName);
            when(builder.like(lowerName, "%joão%")).thenReturn(predicate);

            Predicate result = specification.toPredicate(root, query, builder);

            assertThat(result).isEqualTo(predicate);
            verify(builder).like(lowerName, "%joão%");
        }
    }

    @Nested
    @DisplayName("hasPatientCpf")
    class HasPatientCpf {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should filter case-insensitively with a wildcard pattern when cpf is provided")
        void shouldFilterCaseInsensitivelyWithWildcardPattern() {
            Specification<Prescription> specification = PrescriptionSpecification.hasPatientCpf("52998224725");

            Root<Prescription> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);
            Path<Patient> patientPath = mock(Path.class);
            Path<String> cpfPath = mock(Path.class);
            Expression<String> lowerCpf = mock(Expression.class);
            Predicate predicate = mock(Predicate.class);

            when(root.<Patient>get("patient")).thenReturn(patientPath);
            when(patientPath.<String>get("cpf")).thenReturn(cpfPath);
            when(builder.lower(cpfPath)).thenReturn(lowerCpf);
            when(builder.like(lowerCpf, "%52998224725%")).thenReturn(predicate);

            Predicate result = specification.toPredicate(root, query, builder);

            assertThat(result).isEqualTo(predicate);
        }
    }

    @Nested
    @DisplayName("hasStatus")
    class HasStatus {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should return an unrestricted specification when status is null")
        void shouldReturnUnrestrictedSpecificationWhenStatusIsNull() {
            Specification<Prescription> specification = PrescriptionSpecification.hasStatus(null);

            Root<Prescription> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);

            specification.toPredicate(root, query, builder);

            verify(root, never()).get(anyString());
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should filter by status when provided")
        void shouldFilterByStatusWhenProvided() {
            Specification<Prescription> specification = PrescriptionSpecification.hasStatus(PrescriptionStatus.APPROVED);

            Root<Prescription> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);
            Path<PrescriptionStatus> statusPath = mock(Path.class);
            Predicate predicate = mock(Predicate.class);

            when(root.<PrescriptionStatus>get("status")).thenReturn(statusPath);
            when(builder.equal(statusPath, PrescriptionStatus.APPROVED)).thenReturn(predicate);

            Predicate result = specification.toPredicate(root, query, builder);

            assertThat(result).isEqualTo(predicate);
        }
    }

    @Nested
    @DisplayName("hasIssueDate")
    class HasIssueDate {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should filter by issue date when provided")
        void shouldFilterByIssueDateWhenProvided() {
            LocalDate issueDate = LocalDate.of(2026, 1, 10);
            Specification<Prescription> specification = PrescriptionSpecification.hasIssueDate(issueDate);

            Root<Prescription> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);
            Path<LocalDate> issueDatePath = mock(Path.class);
            Predicate predicate = mock(Predicate.class);

            when(root.<LocalDate>get("issueDate")).thenReturn(issueDatePath);
            when(builder.equal(issueDatePath, issueDate)).thenReturn(predicate);

            Predicate result = specification.toPredicate(root, query, builder);

            assertThat(result).isEqualTo(predicate);
        }
    }
}
