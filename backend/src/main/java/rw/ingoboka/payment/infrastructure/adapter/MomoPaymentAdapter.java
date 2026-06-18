package rw.ingoboka.payment.infrastructure.adapter;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import rw.ingoboka.payment.domain.PaymentPort;
import rw.ingoboka.shared.config.AppProperties;

@Component
@ConditionalOnProperty(name = "app.payment.provider", havingValue = "momo")
@RequiredArgsConstructor
@Slf4j
public class MomoPaymentAdapter implements PaymentPort {

    private final AppProperties appProperties;
    private final Map<String, MomoPaymentState> payments = new ConcurrentHashMap<>();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public PaymentInitiationResult initiatePayment(PaymentInitiationRequest request) {
        String providerReference = "MOMO-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        payments.put(providerReference, new MomoPaymentState(providerReference, request.paymentReference(), "PENDING"));

        AppProperties.Payment.Momo momo = appProperties.getPayment().getMomo();
        if (momo.getCollectionUrl() != null && !momo.getCollectionUrl().isBlank() && request.phoneNumber() != null) {
            try {
                String payload = """
                        {"amount":"%s","currency":"%s","externalId":"%s","payer":{"partyIdType":"MSISDN","partyId":"%s"}}
                        """
                        .formatted(request.amount(), request.currency(), request.paymentReference(), request.phoneNumber());
                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create(momo.getCollectionUrl()))
                        .header("Content-Type", "application/json")
                        .header("Ocp-Apim-Subscription-Key", momo.getSubscriptionKey() != null ? momo.getSubscriptionKey() : "")
                        .header("X-Reference-Id", providerReference)
                        .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                        .build();
                HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
                log.info("MoMo collection request {} -> {}", providerReference, response.statusCode());
            } catch (Exception e) {
                log.error("MoMo collection failed for {}: {}", providerReference, e.getMessage());
            }
        }

        return new PaymentInitiationResult(
                providerReference,
                momo.getCallbackBaseUrl() != null
                        ? momo.getCallbackBaseUrl() + "/payments/momo/callback"
                        : "/api/v1/payments/momo/callback",
                "PENDING");
    }

    @Override
    public PaymentStatusResult getPaymentStatus(String providerReference) {
        MomoPaymentState state = payments.get(providerReference);
        if (state == null) {
            return new PaymentStatusResult(providerReference, "NOT_FOUND", "Payment not found");
        }
        return new PaymentStatusResult(providerReference, state.status(), "MoMo payment status");
    }

    @Override
    public PaymentCallbackResult processCallback(PaymentCallbackRequest request) {
        MomoPaymentState state = payments.get(request.providerReference());
        if (state == null) {
            state = new MomoPaymentState(request.providerReference(), null, "PENDING");
        }
        boolean success = "SUCCESSFUL".equalsIgnoreCase(request.status()) || "SUCCESS".equalsIgnoreCase(request.status());
        state = state.withStatus(success ? "SUCCESS" : "FAILED");
        payments.put(request.providerReference(), state);
        return new PaymentCallbackResult(request.providerReference(), state.status(), success);
    }

    private record MomoPaymentState(String providerReference, String paymentReference, String status) {
        MomoPaymentState withStatus(String newStatus) {
            return new MomoPaymentState(providerReference, paymentReference, newStatus);
        }
    }
}
