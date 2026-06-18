package rw.ingoboka.customer.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.customer.infrastructure.persistence.entity.DataRequestEntity;

public interface DataRequestRepository extends JpaRepository<DataRequestEntity, UUID> {

    List<DataRequestEntity> findByCitizenProfileIdOrderByCreatedAtDesc(UUID citizenProfileId);
}
