package rw.ingoboka.customer.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.customer.infrastructure.persistence.entity.ConsentEntity;

import java.util.List;
import java.util.UUID;

public interface ConsentRepository extends JpaRepository<ConsentEntity, UUID> {

    List<ConsentEntity> findByCitizenProfileId(UUID citizenProfileId);
}
