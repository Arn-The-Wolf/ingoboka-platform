package rw.ingoboka.payment.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentEventRepository extends JpaRepository<PaymentEventEntity, UUID> {

    List<PaymentEventEntity> findByPaymentIdOrderByOccurredAtAsc(UUID paymentId);
}
