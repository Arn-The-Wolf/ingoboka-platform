package rw.ingoboka.customer.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.customer.infrastructure.persistence.entity.ConsentEntity;

public interface ConsentRepository extends JpaRepository<ConsentEntity, UUID> {

    List<ConsentEntity> findByCitizenProfileIdOrderByGrantedAtDesc(UUID citizenProfileId);
}
