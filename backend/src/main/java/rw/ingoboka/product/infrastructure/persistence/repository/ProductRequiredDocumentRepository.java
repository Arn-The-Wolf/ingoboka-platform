package rw.ingoboka.product.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductRequiredDocumentEntity;

public interface ProductRequiredDocumentRepository extends JpaRepository<ProductRequiredDocumentEntity, UUID> {

    List<ProductRequiredDocumentEntity> findByProductVersionIdOrderBySortOrderAsc(UUID productVersionId);
}
