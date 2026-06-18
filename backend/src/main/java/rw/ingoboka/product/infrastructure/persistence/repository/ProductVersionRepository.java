package rw.ingoboka.product.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductVersionEntity;

public interface ProductVersionRepository extends JpaRepository<ProductVersionEntity, UUID> {

    Optional<ProductVersionEntity> findByProductIdAndVersionNumber(UUID productId, Integer versionNumber);

    Optional<ProductVersionEntity> findByProductIdAndStatus(UUID productId, String status);

    List<ProductVersionEntity> findByProductIdOrderByVersionNumberDesc(UUID productId);
}
