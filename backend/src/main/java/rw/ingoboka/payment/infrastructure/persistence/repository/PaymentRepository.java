package rw.ingoboka.payment.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.payment.infrastructure.persistence.entity.PaymentEntity;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {

    Optional<PaymentEntity> findByPaymentReference(String paymentReference);

    Optional<PaymentEntity> findByProviderReference(String providerReference);
}
