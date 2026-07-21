package com.devluanpaiva.controle_de_remedios.modules.dashboard.service.impl;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.AvailabilityItemDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.AvailabilityListResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.DeliveryQueueSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.DeliveryTimelinePointDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.DeliveryTimelineResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.FulfillmentSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.PrescriptionStatusBreakdownResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.PrescriptionStatusCountDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.QueueItemDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.enums.DeliveryTimelineGranularity;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.service.DashboardService;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryDailyAggregate;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionStatusCount;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemFulfillmentAggregate;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private static final List<PrescriptionStatus> DELIVERABLE_STATUSES = List.of(
            PrescriptionStatus.PENDING, PrescriptionStatus.APPROVED);

    private static final List<PrescriptionStatus> FULFILLED_STATUSES = List.of(
            PrescriptionStatus.DELIVERED, PrescriptionStatus.PARTIAL_DELIVERED);

    private static final int QUEUE_PREVIEW_LIMIT = 5;
    private static final int AVAILABILITY_PREVIEW_LIMIT = 10;
    private static final int DEFAULT_RANGE_DAYS = 30;

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final DeliveryRepository deliveryRepository;
    private final CompanyRepository companyRepository;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    @Override
    @Transactional(readOnly = true)
    public PrescriptionStatusBreakdownResponseDTO getPrescriptionStatusBreakdown(UUID companyId) {
        assertCanView(companyId);

        List<PrescriptionStatusCount> counts = prescriptionRepository.countByCompanyGroupedByStatus(companyId);

        List<PrescriptionStatusCountDTO> items = counts.stream()
                .map(count -> new PrescriptionStatusCountDTO(count.getStatus(), count.getCount()))
                .toList();

        long total = items.stream().mapToLong(PrescriptionStatusCountDTO::count).sum();

        return new PrescriptionStatusBreakdownResponseDTO(total, items);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryQueueSummaryResponseDTO getQueueSummary(UUID companyId) {
        assertCanView(companyId);

        LocalDateTime now = LocalDateTime.now();

        List<LocalDateTime> pendingRequestedAt = prescriptionItemRepository
                .findRequestedAtForPendingItems(companyId, DELIVERABLE_STATUSES);

        Double averageWaitDays = pendingRequestedAt.isEmpty() ? null : pendingRequestedAt.stream()
                .mapToLong(requestedAt -> Duration.between(requestedAt, now).toDays())
                .average()
                .orElse(0);

        List<PrescriptionItem> oldestPending = prescriptionItemRepository.findOldestPendingByCompany(
                companyId, DELIVERABLE_STATUSES, PageRequest.of(0, QUEUE_PREVIEW_LIMIT));

        List<QueueItemDTO> oldestPendingItems = oldestPending.stream()
                .map(item -> toQueueItemDTO(item, now))
                .toList();

        return new DeliveryQueueSummaryResponseDTO(
                (long) pendingRequestedAt.size(), averageWaitDays, oldestPendingItems);
    }

    @Override
    @Transactional(readOnly = true)
    public AvailabilityListResponseDTO getUpcomingAvailability(UUID companyId, int days) {
        assertCanView(companyId);

        LocalDate today = LocalDate.now();
        List<Delivery> deliveries = deliveryRepository
                .findActiveCycleDeliveriesByCompanyAndNextAvailableDateBetween(companyId, today, today.plusDays(days));

        return toAvailabilityListResponseDTO(deliveries, today);
    }

    @Override
    @Transactional(readOnly = true)
    public AvailabilityListResponseDTO getOverdueAvailability(UUID companyId) {
        assertCanView(companyId);

        LocalDate today = LocalDate.now();
        List<Delivery> deliveries = deliveryRepository
                .findActiveCycleDeliveriesByCompanyAndNextAvailableDateBefore(companyId, today);

        return toAvailabilityListResponseDTO(deliveries, today);
    }

    @Override
    @Transactional(readOnly = true)
    public FulfillmentSummaryResponseDTO getFulfillmentSummary(UUID companyId, LocalDate from, LocalDate to) {
        assertCanView(companyId);
        assertValidRange(from, to);

        LocalDate rangeEnd = to != null ? to : LocalDate.now();
        LocalDate rangeStart = from != null ? from : rangeEnd.minusDays(DEFAULT_RANGE_DAYS - 1);

        List<PrescriptionItemFulfillmentAggregate> aggregates = prescriptionItemRepository
                .aggregateFulfillmentByCompanyAndDeliveryDateBetween(companyId, rangeStart, rangeEnd, FULFILLED_STATUSES);

        Map<PrescriptionStatus, PrescriptionItemFulfillmentAggregate> byStatus = aggregates.stream()
                .collect(java.util.stream.Collectors.toMap(
                        PrescriptionItemFulfillmentAggregate::getStatus, aggregate -> aggregate));

        long deliveredCount = countFor(byStatus, PrescriptionStatus.DELIVERED);
        long partialCount = countFor(byStatus, PrescriptionStatus.PARTIAL_DELIVERED);
        long totalCount = deliveredCount + partialCount;

        long deliveredQuantityTotal = quantityFor(
                byStatus, PrescriptionItemFulfillmentAggregate::getDeliveredQuantityTotal);
        long prescribedQuantityTotal = quantityFor(
                byStatus, PrescriptionItemFulfillmentAggregate::getPrescribedQuantityTotal);

        Double completionRate = totalCount == 0 ? null : (double) deliveredCount / totalCount;
        Double coverageRate = prescribedQuantityTotal == 0 ? null
                : (double) deliveredQuantityTotal / prescribedQuantityTotal;

        return new FulfillmentSummaryResponseDTO(
                deliveredCount,
                partialCount,
                totalCount,
                completionRate,
                prescribedQuantityTotal,
                deliveredQuantityTotal,
                coverageRate);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryTimelineResponseDTO getDeliveryTimeline(
            UUID companyId, LocalDate from, LocalDate to, DeliveryTimelineGranularity granularity) {
        assertCanView(companyId);
        assertValidRange(from, to);

        LocalDate rangeEnd = to != null ? to : LocalDate.now();
        LocalDate rangeStart = from != null ? from : rangeEnd.minusDays(DEFAULT_RANGE_DAYS - 1);
        DeliveryTimelineGranularity effectiveGranularity =
                granularity != null ? granularity : DeliveryTimelineGranularity.DAY;

        List<DeliveryDailyAggregate> daily = deliveryRepository
                .aggregateDailyByCompanyAndDeliveryDateBetween(companyId, rangeStart, rangeEnd);

        List<DeliveryTimelinePointDTO> points = bucketize(daily, effectiveGranularity);

        return new DeliveryTimelineResponseDTO(effectiveGranularity, points);
    }

    private List<DeliveryTimelinePointDTO> bucketize(
            List<DeliveryDailyAggregate> daily, DeliveryTimelineGranularity granularity) {
        if (granularity == DeliveryTimelineGranularity.DAY) {
            return daily.stream()
                    .map(day -> new DeliveryTimelinePointDTO(
                            day.getDeliveryDate(), day.getDeliveriesCount(), day.getQuantityTotal()))
                    .toList();
        }

        Map<LocalDate, long[]> buckets = new TreeMap<>();
        for (DeliveryDailyAggregate day : daily) {
            LocalDate bucketStart = granularity == DeliveryTimelineGranularity.WEEK
                    ? day.getDeliveryDate().with(DayOfWeek.MONDAY)
                    : day.getDeliveryDate().withDayOfMonth(1);

            long[] accumulator = buckets.computeIfAbsent(bucketStart, key -> new long[2]);
            accumulator[0] += day.getDeliveriesCount();
            accumulator[1] += day.getQuantityTotal();
        }

        return buckets.entrySet().stream()
                .map(entry -> new DeliveryTimelinePointDTO(entry.getKey(), entry.getValue()[0], entry.getValue()[1]))
                .toList();
    }

    private long countFor(Map<PrescriptionStatus, PrescriptionItemFulfillmentAggregate> byStatus, PrescriptionStatus status) {
        PrescriptionItemFulfillmentAggregate aggregate = byStatus.get(status);
        return aggregate != null ? aggregate.getCount() : 0L;
    }

    private long quantityFor(
            Map<PrescriptionStatus, PrescriptionItemFulfillmentAggregate> byStatus,
            java.util.function.Function<PrescriptionItemFulfillmentAggregate, Long> extractor) {
        return byStatus.values().stream().mapToLong(extractor::apply).sum();
    }

    private QueueItemDTO toQueueItemDTO(PrescriptionItem item, LocalDateTime now) {
        long waitingDays = Duration.between(item.getRequestedAt(), now).toDays();

        return new QueueItemDTO(
                item.getId(),
                item.getPrescription().getId(),
                item.getPrescription().getPatient().getId(),
                item.getPrescription().getPatient().getName(),
                item.getMedicine().getName(),
                item.getUnityType(),
                item.getPrescribedQuantity(),
                item.getRequestedAt(),
                waitingDays);
    }

    private AvailabilityListResponseDTO toAvailabilityListResponseDTO(List<Delivery> deliveries, LocalDate today) {
        List<AvailabilityItemDTO> items = deliveries.stream()
                .sorted(Comparator.comparing(Delivery::getNextAvailableDate))
                .limit(AVAILABILITY_PREVIEW_LIMIT)
                .map(delivery -> new AvailabilityItemDTO(
                        delivery.getId(),
                        delivery.getPatient().getId(),
                        delivery.getPatient().getName(),
                        delivery.getPrescriptionItem().getMedicine().getName(),
                        delivery.getPrescriptionItem().getUnityType(),
                        delivery.getNextAvailableDate(),
                        ChronoUnit.DAYS.between(today, delivery.getNextAvailableDate())))
                .toList();

        return new AvailabilityListResponseDTO((long) deliveries.size(), items);
    }

    private void assertValidRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new BusinessException(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "Intervalo de datas inválido",
                    "INVALID_DATE_RANGE",
                    "from",
                    "A data inicial não pode ser posterior à data final.");
        }
    }

    private void assertCanView(UUID companyId) {
        User actor = securityContextHelper.getCurrentUser();

        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                () -> isMemberOf(companyId, actor));
    }

    private boolean isMemberOf(UUID companyId, User user) {
        return companyRepository.existsByIdAndUsers_Id(companyId, user.getId());
    }
}
