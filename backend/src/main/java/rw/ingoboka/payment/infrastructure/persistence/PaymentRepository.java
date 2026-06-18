package rw.ingoboka.payment.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {

    Optional<PaymentEntity> findByPaymentReference(String paymentReference);

    Optional<PaymentEntity> findByProviderReference(String providerReference);
}
