package rw.ingoboka.billing.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.billing.infrastructure.persistence.entity.PremiumScheduleEntity;

public interface PremiumScheduleRepository extends JpaRepository<PremiumScheduleEntity, UUID> {

    List<PremiumScheduleEntity> findByPolicyIdOrderByInstallmentNumberAsc(UUID policyId);
}
