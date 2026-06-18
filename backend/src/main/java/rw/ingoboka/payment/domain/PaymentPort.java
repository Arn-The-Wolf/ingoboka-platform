package rw.ingoboka.payment.domain;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentPort {

    PaymentInitiationResult initiatePayment(PaymentInitiationRequest request);

    PaymentStatusResult getPaymentStatus(String providerReference);

    PaymentCallbackResult processCallback(PaymentCallbackRequest request);

    record PaymentInitiationRequest(
            UUID paymentId,
            String paymentReference,
            BigDecimal amount,
            String currency,
            String phoneNumber) {
    }

    record PaymentInitiationResult(
            String providerReference,
            String checkoutUrl,
            String status) {
    }

    record PaymentStatusResult(
            String providerReference,
            String status,
            String message) {
    }

    record PaymentCallbackRequest(
            String providerReference,
            String status,
            String rawPayload) {
    }

    record PaymentCallbackResult(
            String providerReference,
            String status,
            boolean success) {
    }
}
