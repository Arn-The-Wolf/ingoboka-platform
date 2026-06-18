package rw.ingoboka.partner.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.partner.infrastructure.persistence.entity.RevenueLedgerEntity;

public interface RevenueLedgerRepository extends JpaRepository<RevenueLedgerEntity, UUID> {

    List<RevenueLedgerEntity> findByOrganizationIdOrderByOccurredAtDesc(UUID organizationId);
}
