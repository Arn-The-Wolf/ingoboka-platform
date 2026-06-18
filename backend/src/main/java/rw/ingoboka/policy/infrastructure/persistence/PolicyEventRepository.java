package rw.ingoboka.policy.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PolicyEventRepository extends JpaRepository<PolicyEventEntity, UUID> {

    List<PolicyEventEntity> findByPolicyIdOrderByOccurredAtDesc(UUID policyId);
}
