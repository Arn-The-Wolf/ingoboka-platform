package rw.ingoboka.claim.application.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import rw.ingoboka.claim.application.dto.ClaimDetailResponse;
import rw.ingoboka.claim.application.dto.ClaimSummaryResponse;
import rw.ingoboka.claim.application.dto.DecideClaimRequest;
import rw.ingoboka.claim.application.dto.SubmitClaimRequest;

@Service
public class ClaimService {

    /**
     * Submits a new claim against an active policy for the authenticated citizen.
     *
     * @param request claim submission details
     * @return created claim summary
     */
    public ClaimSummaryResponse submitClaim(SubmitClaimRequest request) {
        throw new UnsupportedOperationException("Claim submission is not yet implemented");
    }

    /**
     * Lists all claims filed by the authenticated citizen.
     *
     * @return citizen claim summaries ordered by most recent
     */
    public List<ClaimSummaryResponse> listCitizenClaims() {
        throw new UnsupportedOperationException("Listing citizen claims is not yet implemented");
    }

    /**
     * Retrieves full claim details for the authenticated citizen.
     *
     * @param claimId claim identifier
     * @return claim detail including events and decision if present
     */
    public ClaimDetailResponse getClaimDetail(UUID claimId) {
        throw new UnsupportedOperationException("Claim detail retrieval is not yet implemented");
    }

    /**
     * Lists claims awaiting insurer review.
     *
     * @return claims in reviewable statuses
     */
    public List<ClaimSummaryResponse> listPendingClaims() {
        throw new UnsupportedOperationException("Pending claims queue is not yet implemented");
    }

    /**
     * Records an insurer decision on a submitted claim.
     *
     * @param claimId claim identifier
     * @param request decision details
     * @return updated claim detail
     */
    public ClaimDetailResponse decideClaim(UUID claimId, DecideClaimRequest request) {
        throw new UnsupportedOperationException("Claim decision workflow is not yet implemented");
    }
}
