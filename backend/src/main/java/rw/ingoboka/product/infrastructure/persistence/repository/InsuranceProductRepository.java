package rw.ingoboka.product.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.product.infrastructure.persistence.entity.InsuranceProductEntity;

public interface InsuranceProductRepository extends JpaRepository<InsuranceProductEntity, UUID> {

    Page<InsuranceProductEntity> findByStatus(String status, Pageable pageable);

    Page<InsuranceProductEntity> findByOrganizationIdOrderByNameAsc(UUID organizationId, Pageable pageable);

    List<InsuranceProductEntity> findByStatusOrderByNameAsc(String status);

    boolean existsByOrganizationIdAndCode(UUID organizationId, String code);

    Optional<InsuranceProductEntity> findByOrganizationIdAndCode(UUID organizationId, String code);
}
