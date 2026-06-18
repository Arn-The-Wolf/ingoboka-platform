package rw.ingoboka.payment.application.port;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentPort {

    String initiatePayment(UUID policyId, BigDecimal amount, String currency);

    boolean processCallback(String providerReference, String status);
}
