package rw.ingoboka.product.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductPlanEntity;

import java.util.List;
import java.util.UUID;

public interface ProductPlanRepository extends JpaRepository<ProductPlanEntity, UUID> {

    List<ProductPlanEntity> findByProductVersionId(UUID productVersionId);
}
