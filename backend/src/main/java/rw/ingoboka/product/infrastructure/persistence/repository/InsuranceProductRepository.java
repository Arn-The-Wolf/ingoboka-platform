package rw.ingoboka.product.infrastructure.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.product.infrastructure.persistence.entity.InsuranceProductEntity;

import java.util.UUID;

public interface InsuranceProductRepository extends JpaRepository<InsuranceProductEntity, UUID> {

    Page<InsuranceProductEntity> findByStatus(String status, Pageable pageable);
}
