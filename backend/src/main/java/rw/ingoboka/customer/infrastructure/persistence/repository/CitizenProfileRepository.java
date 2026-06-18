package rw.ingoboka.customer.infrastructure.persistence.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.customer.infrastructure.persistence.entity.CitizenProfileEntity;

public interface CitizenProfileRepository extends JpaRepository<CitizenProfileEntity, UUID> {

    Optional<CitizenProfileEntity> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    boolean existsByNationalId(String nationalId);
}
