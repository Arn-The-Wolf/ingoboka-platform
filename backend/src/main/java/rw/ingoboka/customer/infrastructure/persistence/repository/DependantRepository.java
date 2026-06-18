package rw.ingoboka.customer.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.customer.infrastructure.persistence.entity.DependantEntity;

public interface DependantRepository extends JpaRepository<DependantEntity, UUID> {

    List<DependantEntity> findByCitizenProfileIdAndActiveTrueOrderByCreatedAtDesc(UUID citizenProfileId);
}
