package rw.ingoboka.partner.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.partner.infrastructure.persistence.entity.ContractPriceRuleEntity;

public interface ContractPriceRuleRepository extends JpaRepository<ContractPriceRuleEntity, UUID> {

    List<ContractPriceRuleEntity> findByContractIdOrderByEffectiveFromDesc(UUID contractId);
}
