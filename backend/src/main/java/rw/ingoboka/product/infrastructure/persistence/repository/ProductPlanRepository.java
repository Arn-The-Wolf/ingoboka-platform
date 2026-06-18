package rw.ingoboka.product.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductPlanEntity;

public interface ProductPlanRepository extends JpaRepository<ProductPlanEntity, UUID> {

    List<ProductPlanEntity> findByProductVersionIdOrderByPremiumAmountAsc(UUID productVersionId);

    Optional<ProductPlanEntity> findByProductVersionIdAndIsDefaultTrue(UUID productVersionId);
}
