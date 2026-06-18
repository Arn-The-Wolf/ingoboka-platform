package rw.ingoboka.claim.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimDocumentRepository extends JpaRepository<ClaimDocumentEntity, UUID> {

    List<ClaimDocumentEntity> findByClaimIdOrderByUploadedAtDesc(UUID claimId);
}
