package rw.ingoboka.payment.application.service;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.customer.infrastructure.persistence.entity.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.repository.CitizenProfileRepository;
import rw.ingoboka.enrollment.application.service.EnrollmentService;
import rw.ingoboka.enrollment.infrastructure.persistence.entity.PolicyApplicationEntity;
import rw.ingoboka.payment.api.dto.request.InitiatePaymentRequest;
import rw.ingoboka.payment.api.dto.request.SandboxCallbackRequest;
import rw.ingoboka.payment.api.dto.response.PaymentResponse;
import rw.ingoboka.payment.api.dto.response.PaymentStatusResponse;
import rw.ingoboka.payment.domain.PaymentPort;
import rw.ingoboka.payment.infrastructure.persistence.PaymentEventEntity;
import rw.ingoboka.payment.infrastructure.persistence.PaymentEventRepository;
import rw.ingoboka.payment.infrastructure.persistence.entity.PaymentEntity;
import rw.ingoboka.payment.infrastructure.persistence.repository.PaymentRepository;
import rw.ingoboka.billing.application.service.PremiumScheduleService;
import rw.ingoboka.partner.application.service.PartnerRevenueService;
import rw.ingoboka.policy.application.service.PolicyService;
import rw.ingoboka.policy.infrastructure.persistence.entity.PolicyEntity;
import rw.ingoboka.policy.infrastructure.persistence.repository.PolicyRepository;
import rw.ingoboka.shared.exception.BadRequestException;
import rw.ingoboka.shared.exception.NotFoundException;
import rw.ingoboka.shared.notification.NotificationService;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final String SANDBOX_PROVIDER = "SANDBOX";

    private final PaymentRepository paymentRepository;
    private final PaymentEventRepository paymentEventRepository;
    private final CitizenProfileRepository profileRepository;
    private final PolicyRepository policyRepository;
    private final PolicyService policyService;
    private final EnrollmentService enrollmentService;
    private final PaymentPort paymentPort;
    private final NotificationService notificationService;
    private final PremiumScheduleService premiumScheduleService;
    private final PartnerRevenueService partnerRevenueService;

    @Transactional
    public PaymentResponse initiateSandboxPayment(UUID policyId, UUID userId, InitiatePaymentRequest request) {
        CitizenProfileEntity profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", userId));

        UUID resolvedPolicyId = policyId != null ? policyId : request.getPolicyId();
        PolicyEntity policy;

        if (resolvedPolicyId != null) {
            final UUID lookupId = resolvedPolicyId;
            policy = policyRepository.findById(lookupId)
                    .orElseThrow(() -> new NotFoundException("Policy", lookupId));
            if (!policy.getCitizenProfileId().equals(profile.getId())) {
                throw new NotFoundException("Policy", lookupId);
            }
        } else if (request.getApplicationId() != null) {
            PolicyApplicationEntity application = enrollmentService.getApprovedApplication(
                    request.getApplicationId(), userId);
            policy = policyRepository.findByApplicationId(application.getId()).orElseGet(() ->
                    policyService.activateFromApplication(
                            application.getId(),
                            application.getCitizenProfileId(),
                            application.getProductPlanId(),
                            application.getOrganizationId(),
                            application.getPremiumAmount(),
                            application.getCurrency()));
            resolvedPolicyId = policy.getId();
        } else {
            throw new BadRequestException("Either policyId or applicationId is required");
        }

        final UUID paymentPolicyId = resolvedPolicyId;

        PaymentEntity payment = new PaymentEntity();
        payment.setPaymentReference(generatePaymentReference());
        payment.setPolicyId(paymentPolicyId);
        payment.setCitizenProfileId(profile.getId());
        payment.setOrganizationId(policy.getOrganizationId());
        payment.setAmount(policy.getPremiumAmount());
        payment.setCurrency(policy.getCurrency());
        payment.setPaymentMethod("MOBILE_MONEY");
        payment.setStatus("PENDING");
        payment.setProvider(SANDBOX_PROVIDER);
        payment.setInitiatedAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        PaymentPort.PaymentInitiationResult result = paymentPort.initiatePayment(
                new PaymentPort.PaymentInitiationRequest(
                        payment.getId(),
                        payment.getPaymentReference(),
                        payment.getAmount(),
                        payment.getCurrency(),
                        null));

        payment.setProviderReference(result.providerReference());
        payment.setStatus("PROCESSING");
        payment = paymentRepository.save(payment);
        recordEvent(payment.getId(), "INITIATED", SANDBOX_PROVIDER);

        return PaymentResponse.builder()
                .id(payment.getId())
                .paymentReference(payment.getPaymentReference())
                .providerReference(payment.getProviderReference())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .instructions("Complete sandbox payment at: " + result.checkoutUrl())
                .build();
    }

    @Transactional
    public void processSandboxCallback(SandboxCallbackRequest request) {
        PaymentEntity payment = paymentRepository.findByProviderReference(request.getProviderReference())
                .orElseThrow(() -> new NotFoundException("Payment", request.getProviderReference()));

        PaymentPort.PaymentCallbackResult result = paymentPort.processCallback(
                new PaymentPort.PaymentCallbackRequest(
                        request.getProviderReference(),
                        request.getStatus(),
                        "{}"));

        recordEvent(payment.getId(), "CALLBACK_RECEIVED", SANDBOX_PROVIDER);

        if (result.success()) {
            payment.setStatus("COMPLETED");
            payment.setCompletedAt(LocalDateTime.now());
            recordEvent(payment.getId(), "COMPLETED", SANDBOX_PROVIDER);
            activatePolicyAfterPayment(payment);
        } else {
            payment.setStatus("FAILED");
            payment.setCompletedAt(LocalDateTime.now());
            recordEvent(payment.getId(), "FAILED", SANDBOX_PROVIDER);
        }
        paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatus(UUID paymentId, UUID userId) {
        CitizenProfileEntity profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", userId));
        PaymentEntity payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment", paymentId));
        if (!payment.getCitizenProfileId().equals(profile.getId())) {
            throw new NotFoundException("Payment", paymentId);
        }

        return PaymentStatusResponse.builder()
                .id(payment.getId())
                .status(payment.getStatus())
                .paymentReference(payment.getPaymentReference())
                .build();
    }

    private void activatePolicyAfterPayment(PaymentEntity payment) {
        PolicyEntity policy = policyRepository.findById(payment.getPolicyId())
                .orElseThrow(() -> new NotFoundException("Policy", payment.getPolicyId()));
        policy.setStatus("ACTIVE");
        policy.setActivatedAt(LocalDateTime.now());
        policyRepository.save(policy);

        premiumScheduleService.createInitialSchedule(policy);
        partnerRevenueService.recordPaymentCommission(
                payment.getOrganizationId(),
                payment.getId(),
                payment.getAmount(),
                payment.getCurrency());

        if (policy.getApplicationId() != null) {
            enrollmentService.markConverted(policy.getApplicationId());
        }

        notificationService.notifyPolicyActivated(payment.getCitizenProfileId(), policy.getPolicyNumber());
    }

    private void recordEvent(UUID paymentId, String eventType, String source) {
        PaymentEventEntity event = new PaymentEventEntity();
        event.setPaymentId(paymentId);
        event.setEventType(eventType);
        event.setSource(source);
        paymentEventRepository.save(event);
    }

    private String generatePaymentReference() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
}
