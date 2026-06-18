package rw.ingoboka.customer.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DataRequestRepository extends JpaRepository<DataRequestEntity, UUID> {

    List<DataRequestEntity> findByProfileIdOrderByCreatedAtDesc(UUID profileId);
}
