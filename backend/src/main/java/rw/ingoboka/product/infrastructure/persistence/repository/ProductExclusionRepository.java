package rw.ingoboka.product.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductExclusionEntity;

public interface ProductExclusionRepository extends JpaRepository<ProductExclusionEntity, UUID> {

    List<ProductExclusionEntity> findByProductVersionIdOrderBySortOrderAsc(UUID productVersionId);
}
