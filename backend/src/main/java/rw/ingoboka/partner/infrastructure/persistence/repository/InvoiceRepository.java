package rw.ingoboka.partner.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.partner.infrastructure.persistence.entity.InvoiceEntity;

public interface InvoiceRepository extends JpaRepository<InvoiceEntity, UUID> {

    List<InvoiceEntity> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
}
