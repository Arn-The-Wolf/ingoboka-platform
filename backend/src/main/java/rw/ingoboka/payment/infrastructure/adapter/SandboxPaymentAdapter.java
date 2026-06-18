package rw.ingoboka.payment.infrastructure.adapter;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import rw.ingoboka.payment.domain.PaymentPort;

public class SandboxPaymentAdapter implements PaymentPort {

    private final Map<String, SandboxPaymentState> payments = new ConcurrentHashMap<>();

    @Override
    public PaymentInitiationResult initiatePayment(PaymentInitiationRequest request) {
        String providerReference = "SBX-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        payments.put(providerReference, new SandboxPaymentState(
                providerReference,
                request.paymentReference(),
                request.amount(),
                request.currency(),
                "PENDING"));

        return new PaymentInitiationResult(
                providerReference,
                "/api/v1/payments/sandbox/checkout/" + providerReference,
                "PENDING");
    }

    @Override
    public PaymentStatusResult getPaymentStatus(String providerReference) {
        SandboxPaymentState state = payments.get(providerReference);
        if (state == null) {
            return new PaymentStatusResult(providerReference, "NOT_FOUND", "Sandbox payment not found");
        }
        return new PaymentStatusResult(providerReference, state.status(), "Sandbox payment status");
    }

    @Override
    public PaymentCallbackResult processCallback(PaymentCallbackRequest request) {
        SandboxPaymentState state = payments.get(request.providerReference());
        if (state == null) {
            return new PaymentCallbackResult(request.providerReference(), "NOT_FOUND", false);
        }

        String normalizedStatus = request.status() != null ? request.status().toUpperCase() : "FAILED";
        boolean success = "SUCCESS".equals(normalizedStatus);
        state = state.withStatus(success ? "SUCCESS" : "FAILED");
        payments.put(request.providerReference(), state);

        return new PaymentCallbackResult(request.providerReference(), state.status(), success);
    }

    private record SandboxPaymentState(
            String providerReference,
            String paymentReference,
            java.math.BigDecimal amount,
            String currency,
            String status) {

        SandboxPaymentState withStatus(String newStatus) {
            return new SandboxPaymentState(providerReference, paymentReference, amount, currency, newStatus);
        }
    }
}
