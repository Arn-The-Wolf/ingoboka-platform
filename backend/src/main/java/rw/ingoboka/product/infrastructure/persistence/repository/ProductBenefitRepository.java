package rw.ingoboka.product.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductBenefitEntity;

public interface ProductBenefitRepository extends JpaRepository<ProductBenefitEntity, UUID> {

    List<ProductBenefitEntity> findByProductVersionIdOrderBySortOrderAsc(UUID productVersionId);
}
