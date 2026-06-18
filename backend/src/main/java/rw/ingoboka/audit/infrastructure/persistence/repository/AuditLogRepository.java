package rw.ingoboka.audit.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.audit.infrastructure.persistence.entity.AuditLogEntity;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLogEntity, UUID> {

    List<AuditLogEntity> findByEntityTypeAndEntityId(String entityType, UUID entityId);

    List<AuditLogEntity> findByActorId(UUID actorId);

    List<AuditLogEntity> findByOrganizationId(UUID organizationId);
}
