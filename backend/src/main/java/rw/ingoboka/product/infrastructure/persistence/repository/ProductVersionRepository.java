package rw.ingoboka.product.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductVersionEntity;

import java.util.Optional;
import java.util.UUID;

public interface ProductVersionRepository extends JpaRepository<ProductVersionEntity, UUID> {

    Optional<ProductVersionEntity> findByProductIdAndStatus(UUID productId, String status);
}
