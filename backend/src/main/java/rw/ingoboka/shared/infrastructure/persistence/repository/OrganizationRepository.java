package rw.ingoboka.shared.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.shared.infrastructure.persistence.entity.OrganizationEntity;

public interface OrganizationRepository extends JpaRepository<OrganizationEntity, UUID> {

    List<OrganizationEntity> findAllByOrderByNameAsc();
}
