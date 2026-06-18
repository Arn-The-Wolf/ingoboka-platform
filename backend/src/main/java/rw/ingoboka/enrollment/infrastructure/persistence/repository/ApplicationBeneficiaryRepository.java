package rw.ingoboka.enrollment.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.ingoboka.enrollment.infrastructure.persistence.entity.ApplicationBeneficiaryEntity;

public interface ApplicationBeneficiaryRepository extends JpaRepository<ApplicationBeneficiaryEntity, UUID> {

    List<ApplicationBeneficiaryEntity> findByApplicationId(UUID applicationId);
}
