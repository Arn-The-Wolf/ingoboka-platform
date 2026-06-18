package rw.ingoboka.payment.application.service;

import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.customer.infrastructure.persistence.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.CitizenProfileRepository;
import rw.ingoboka.payment.application.dto.InitiateSandboxPaymentRequest;
import rw.ingoboka.payment.application.dto.PaymentStatusResponse;
import rw.ingoboka.payment.application.dto.SandboxPaymentCallbackRequest;
import rw.ingoboka.payment.domain.PaymentPort;
import rw.ingoboka.payment.infrastructure.persistence.PaymentEntity;
import rw.ingoboka.payment.infrastructure.persistence.PaymentEntity.PaymentStatus;
import rw.ingoboka.payment.infrastructure.persistence.PaymentEventEntity;
import rw.ingoboka.payment.infrastructure.persistence.PaymentEventEntity.PaymentEventType;
import rw.ingoboka.payment.infrastructure.persistence.PaymentEventRepository;
import rw.ingoboka.payment.infrastructure.persistence.PaymentRepository;
import rw.ingoboka.shared.exception.NotFoundException;
import rw.ingoboka.shared.security.SecurityUtils;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final String SANDBOX_PROVIDER = "SANDBOX";

    private final PaymentRepository paymentRepository;
    private final PaymentEventRepository paymentEventRepository;
    private final CitizenProfileRepository citizenProfileRepository;
    private final PaymentPort paymentPort;

    @Transactional
    public PaymentStatusResponse initiateSandboxPayment(InitiateSandboxPaymentRequest request) {
        CitizenProfileEntity profile = citizenProfileRepository.findByUserId(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new NotFoundException("Citizen profile", SecurityUtils.getCurrentUserId()));

        PaymentEntity payment = new PaymentEntity();
        payment.setPaymentReference(generatePaymentReference());
        payment.setPolicyId(request.policyId());
        payment.setCitizenProfileId(profile.getId());
        payment.setAmount(request.amount());
        payment.setCurrency(request.currency());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setProvider(SANDBOX_PROVIDER);
        payment.setInitiatedAt(Instant.now());
        payment = paymentRepository.save(payment);

        PaymentPort.PaymentInitiationResult result = paymentPort.initiatePayment(
                new PaymentPort.PaymentInitiationRequest(
                        payment.getId(),
                        payment.getPaymentReference(),
                        payment.getAmount(),
                        payment.getCurrency(),
                        request.phoneNumber()));

        payment.setProviderReference(result.providerReference());
        payment.setStatus(PaymentStatus.PENDING);
        payment = paymentRepository.save(payment);

        recordEvent(payment.getId(), PaymentEventType.INITIATED, "{\"provider\":\"SANDBOX\"}");

        return toResponse(payment, result.checkoutUrl());
    }

    @Transactional
    public PaymentStatusResponse processSandboxCallback(SandboxPaymentCallbackRequest request) {
        PaymentEntity payment = paymentRepository.findByProviderReference(request.providerReference())
                .orElseThrow(() -> new NotFoundException("Payment", request.providerReference()));

        PaymentPort.PaymentCallbackResult result = paymentPort.processCallback(
                new PaymentPort.PaymentCallbackRequest(
                        request.providerReference(),
                        request.status(),
                        request.rawPayload()));

        recordEvent(payment.getId(), PaymentEventType.CALLBACK_RECEIVED, request.rawPayload());

        if (result.success()) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setCompletedAt(Instant.now());
            recordEvent(payment.getId(), PaymentEventType.SUCCESS, null);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setCompletedAt(Instant.now());
            recordEvent(payment.getId(), PaymentEventType.FAILED, null);
        }

        return toResponse(paymentRepository.save(payment), null);
    }

    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatus(UUID paymentId) {
        PaymentEntity payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment", paymentId));

        CitizenProfileEntity profile = citizenProfileRepository.findByUserId(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new NotFoundException("Citizen profile", SecurityUtils.getCurrentUserId()));
        if (!payment.getCitizenProfileId().equals(profile.getId())) {
            throw new NotFoundException("Payment", paymentId);
        }

        if (payment.getProviderReference() != null && payment.getStatus() == PaymentStatus.PENDING) {
            PaymentPort.PaymentStatusResult providerStatus =
                    paymentPort.getPaymentStatus(payment.getProviderReference());
            if ("SUCCESS".equals(providerStatus.status())) {
                payment.setStatus(PaymentStatus.SUCCESS);
            } else if ("FAILED".equals(providerStatus.status())) {
                payment.setStatus(PaymentStatus.FAILED);
            }
        }

        return toResponse(payment, buildCheckoutUrl(payment));
    }

    private String buildCheckoutUrl(PaymentEntity payment) {
        if (payment.getProviderReference() == null) {
            return null;
        }
        return "/api/v1/payments/sandbox/checkout/" + payment.getProviderReference();
    }

    private void recordEvent(UUID paymentId, PaymentEventType eventType, String payload) {
        PaymentEventEntity event = new PaymentEventEntity();
        event.setPaymentId(paymentId);
        event.setEventType(eventType);
        event.setPayloadJson(payload);
        event.setOccurredAt(Instant.now());
        paymentEventRepository.save(event);
    }

    private String generatePaymentReference() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }

    private PaymentStatusResponse toResponse(PaymentEntity payment, String checkoutUrl) {
        return new PaymentStatusResponse(
                payment.getId(),
                payment.getPaymentReference(),
                payment.getPolicyId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getProvider(),
                payment.getProviderReference(),
                checkoutUrl,
                payment.getInitiatedAt(),
                payment.getCompletedAt());
    }
}
