package rw.ingoboka.enrollment.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.enrollment.infrastructure.persistence.entity.PolicyApplicationEntity;

public interface PolicyApplicationRepository extends JpaRepository<PolicyApplicationEntity, UUID> {

    Page<PolicyApplicationEntity> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId, Pageable pageable);
}
