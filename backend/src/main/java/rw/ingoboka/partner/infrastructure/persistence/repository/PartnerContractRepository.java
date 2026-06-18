package rw.ingoboka.partner.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.partner.infrastructure.persistence.entity.PartnerContractEntity;

public interface PartnerContractRepository extends JpaRepository<PartnerContractEntity, UUID> {

    List<PartnerContractEntity> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
}
