package rw.ingoboka.customer.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.customer.infrastructure.persistence.entity.CitizenProfileEntity;

import java.util.Optional;
import java.util.UUID;

public interface CitizenProfileRepository extends JpaRepository<CitizenProfileEntity, UUID> {

    Optional<CitizenProfileEntity> findByUserId(UUID userId);

    boolean existsByNationalId(String nationalId);
}
