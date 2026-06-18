package rw.ingoboka.policy.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.policy.infrastructure.persistence.entity.PolicyEntity;

import java.util.List;
import java.util.UUID;

public interface PolicyRepository extends JpaRepository<PolicyEntity, UUID> {

    List<PolicyEntity> findByCitizenProfileId(UUID citizenProfileId);
}
