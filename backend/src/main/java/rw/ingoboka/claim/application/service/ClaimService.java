package rw.ingoboka.claim.application.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import rw.ingoboka.audit.domain.AuditEvent;
import rw.ingoboka.claim.api.dto.request.AppealRequest;
import rw.ingoboka.claim.api.dto.request.ClaimDecisionRequest;
import rw.ingoboka.claim.api.dto.request.CreateClaimRequest;
import rw.ingoboka.claim.api.dto.request.UpdateClaimStatusRequest;
import rw.ingoboka.claim.api.dto.response.ClaimResponse;
import rw.ingoboka.claim.api.dto.response.ClaimStatusResponse;
import rw.ingoboka.claim.api.dto.response.ClaimSummaryResponse;
import rw.ingoboka.claim.infrastructure.persistence.ClaimAppealEntity;
import rw.ingoboka.claim.infrastructure.persistence.ClaimAppealRepository;
import rw.ingoboka.claim.infrastructure.persistence.ClaimDecisionEntity;
import rw.ingoboka.claim.infrastructure.persistence.ClaimDecisionRepository;
import rw.ingoboka.claim.infrastructure.persistence.ClaimDocumentEntity;
import rw.ingoboka.claim.infrastructure.persistence.ClaimDocumentRepository;
import rw.ingoboka.claim.infrastructure.persistence.ClaimEntity;
import rw.ingoboka.claim.infrastructure.persistence.ClaimRepository;
import rw.ingoboka.claim.infrastructure.persistence.ClaimStatusHistoryEntity;
import rw.ingoboka.claim.infrastructure.persistence.ClaimStatusHistoryRepository;
import rw.ingoboka.customer.infrastructure.persistence.entity.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.repository.CitizenProfileRepository;
import rw.ingoboka.identity.infrastructure.persistence.repository.UserRepository;
import rw.ingoboka.policy.infrastructure.persistence.entity.PolicyEntity;
import rw.ingoboka.policy.infrastructure.persistence.repository.PolicyRepository;
import rw.ingoboka.shared.domain.PageResponse;
import rw.ingoboka.shared.exception.BadRequestException;
import rw.ingoboka.shared.exception.NotFoundException;
import rw.ingoboka.shared.storage.DocumentStorageService;

import rw.ingoboka.shared.notification.NotificationService;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ClaimDocumentRepository claimDocumentRepository;
    private final ClaimDecisionRepository claimDecisionRepository;
    private final ClaimStatusHistoryRepository statusHistoryRepository;
    private final ClaimAppealRepository appealRepository;
    private final CitizenProfileRepository profileRepository;
    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final DocumentStorageService documentStorageService;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificationService notificationService;

    @Transactional
    public ClaimResponse createClaim(UUID organizationId, UUID userId, CreateClaimRequest request) {
        CitizenProfileEntity profile = getProfile(userId);
        PolicyEntity policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new NotFoundException("Policy", request.getPolicyId()));
        if (!policy.getCitizenProfileId().equals(profile.getId())) {
            throw new NotFoundException("Policy", request.getPolicyId());
        }
        if (!"ACTIVE".equals(policy.getStatus())) {
            throw new BadRequestException("Claims can only be filed against active policies");
        }

        ClaimEntity claim = new ClaimEntity();
        claim.setClaimNumber(generateClaimNumber());
        claim.setPolicyId(policy.getId());
        claim.setCitizenProfileId(profile.getId());
        claim.setOrganizationId(policy.getOrganizationId());
        claim.setStatus("DRAFT");
        claim.setIncidentDate(request.getIncidentDate());
        claim.setClaimType(request.getClaimType());
        claim.setDescription(request.getDescription());
        claim.setClaimedAmount(request.getClaimedAmount());
        claim.setCurrency(policy.getCurrency());
        claim = claimRepository.save(claim);

        publishAudit(userId, "CLAIM_CREATED", claim.getId());
        return toResponse(claim);
    }

    @Transactional
    public ClaimResponse submitClaim(UUID claimId, UUID userId) {
        ClaimEntity claim = getClaimForCitizen(claimId, userId);
        if (!"DRAFT".equals(claim.getStatus())) {
            throw new BadRequestException("Only draft claims can be submitted");
        }
        transition(claim, "SUBMITTED", "Claim submitted by citizen", userId);
        claim.setSubmittedAt(Instant.now());
        claimRepository.save(claim);
        publishAudit(userId, "CLAIM_SUBMITTED", claim.getId());
        return toResponse(claim);
    }

    @Transactional(readOnly = true)
    public ClaimStatusResponse getClaimStatus(UUID claimId, UUID userId) {
        ClaimEntity claim = getClaimForCitizen(claimId, userId);
        ClaimStatusResponse response = new ClaimStatusResponse();
        response.setId(claim.getId());
        response.setStatus(claim.getStatus());
        claimDecisionRepository.findByClaimId(claim.getId())
                .ifPresent(d -> response.setNote(d.getRationale()));
        return response;
    }

    @Transactional(readOnly = true)
    public PageResponse<ClaimSummaryResponse> listCitizenClaims(UUID userId, Pageable pageable) {
        CitizenProfileEntity profile = getProfile(userId);
        Page<ClaimEntity> page = claimRepository.findByCitizenProfileIdOrderByReportedAtDesc(profile.getId(), pageable);
        return PageResponse.from(page.map(this::toSummary));
    }

    @Transactional(readOnly = true)
    public PageResponse<ClaimSummaryResponse> listOrganizationClaims(UUID organizationId, Pageable pageable) {
        Page<ClaimEntity> page = claimRepository.findByOrganizationIdOrderByReportedAtDesc(organizationId, pageable);
        return PageResponse.from(page.map(this::toSummary));
    }

    @Transactional(readOnly = true)
    public ClaimSummaryResponse getOrganizationClaim(UUID claimId, UUID organizationId) {
        ClaimEntity claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new NotFoundException("Claim", claimId));
        if (!claim.getOrganizationId().equals(organizationId)) {
            throw new NotFoundException("Claim", claimId);
        }
        return toSummary(claim);
    }

    @Transactional
    public ClaimResponse updateClaimStatus(UUID claimId, UUID userId, UpdateClaimStatusRequest request) {
        ClaimEntity claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new NotFoundException("Claim", claimId));
        transition(claim, request.getStatus(), request.getNote(), userId);
        claimRepository.save(claim);
        publishAudit(userId, "CLAIM_STATUS_UPDATED", claim.getId());
        return toResponse(claim);
    }

    @Transactional
    public ClaimResponse recordDecision(UUID claimId, UUID userId, ClaimDecisionRequest request) {
        ClaimEntity claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new NotFoundException("Claim", claimId));

        String decision = request.getDecision() != null ? request.getDecision().toUpperCase() : "REJECTED";
        String newStatus = switch (decision) {
            case "APPROVED" -> "APPROVED";
            case "PARTIALLY_APPROVED" -> "PARTIALLY_APPROVED";
            default -> "REJECTED";
        };

        ClaimDecisionEntity decisionEntity = new ClaimDecisionEntity();
        decisionEntity.setClaimId(claim.getId());
        decisionEntity.setDecision(decision);
        decisionEntity.setRationale(request.getReason() != null ? request.getReason() : decision);
        decisionEntity.setDecidedBy(userId);
        decisionEntity.setCurrency(claim.getCurrency());
        if ("APPROVED".equals(decision) || "PARTIALLY_APPROVED".equals(decision)) {
            decisionEntity.setApprovedAmount(claim.getClaimedAmount());
            claim.setApprovedAmount(claim.getClaimedAmount());
        }
        claimDecisionRepository.save(decisionEntity);

        transition(claim, newStatus, request.getReason(), userId);
        claim.setResolvedAt(Instant.now());
        claimRepository.save(claim);
        profileRepository.findById(claim.getCitizenProfileId()).ifPresent(p ->
                notificationService.notifyClaimDecision(p.getId(), claim.getClaimNumber(), newStatus));
        publishAudit(userId, "CLAIM_DECISION_RECORDED", claim.getId());
        return toResponse(claim);
    }

    @Transactional
    public ClaimResponse submitAppeal(UUID claimId, UUID userId, AppealRequest request) {
        ClaimEntity claim = getClaimForCitizen(claimId, userId);
        if (!"REJECTED".equals(claim.getStatus()) && !"PARTIALLY_APPROVED".equals(claim.getStatus())) {
            throw new BadRequestException("Appeals are only allowed for rejected or partially approved claims");
        }

        ClaimAppealEntity appeal = new ClaimAppealEntity();
        appeal.setClaimId(claim.getId());
        appeal.setAppealNumber("APL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        appeal.setReason(request.getReason());
        appeal.setSubmittedBy(userId);
        appeal.setRequestedAmount(claim.getClaimedAmount());
        appealRepository.save(appeal);

        transition(claim, "APPEALED", request.getReason(), userId);
        claimRepository.save(claim);
        publishAudit(userId, "CLAIM_APPEALED", claim.getId());
        return toResponse(claim);
    }

    @Transactional
    public ClaimResponse attachDocument(UUID claimId, UUID userId, String documentType, MultipartFile file) {
        ClaimEntity claim = getClaimForCitizen(claimId, userId);
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Document file is required");
        }

        DocumentStorageService.StoredDocument stored;
        try {
            stored = documentStorageService.store(
                    "claims/" + claim.getId(),
                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "document",
                    file.getInputStream(),
                    file.getSize(),
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        } catch (Exception e) {
            throw new BadRequestException("Failed to upload document: " + e.getMessage());
        }

        ClaimDocumentEntity document = new ClaimDocumentEntity();
        document.setClaimId(claim.getId());
        document.setDocumentType(documentType != null ? documentType : "OTHER");
        document.setFileName(stored.fileName());
        document.setFilePath(stored.storageKey());
        document.setFileSizeBytes(stored.size());
        document.setMimeType(stored.contentType());
        document.setUploadedBy(userId);
        claimDocumentRepository.save(document);

        publishAudit(userId, "CLAIM_DOCUMENT_UPLOADED", claim.getId());
        return toResponse(claim);
    }

    private void transition(ClaimEntity claim, String toStatus, String reason, UUID actorId) {
        String from = claim.getStatus();
        claim.setStatus(toStatus);
        ClaimStatusHistoryEntity history = new ClaimStatusHistoryEntity();
        history.setClaimId(claim.getId());
        history.setFromStatus(from);
        history.setToStatus(toStatus);
        history.setReason(reason);
        history.setChangedBy(actorId);
        statusHistoryRepository.save(history);
    }

    private ClaimEntity getClaimForCitizen(UUID claimId, UUID userId) {
        CitizenProfileEntity profile = getProfile(userId);
        ClaimEntity claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new NotFoundException("Claim", claimId));
        if (!claim.getCitizenProfileId().equals(profile.getId())) {
            throw new NotFoundException("Claim", claimId);
        }
        return claim;
    }

    private CitizenProfileEntity getProfile(UUID userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", userId));
    }

    private String generateClaimNumber() {
        return "ING-CLM-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private ClaimResponse toResponse(ClaimEntity claim) {
        ClaimResponse response = new ClaimResponse();
        response.setId(claim.getId());
        response.setClaimNumber(claim.getClaimNumber());
        response.setStatus(claim.getStatus());
        return response;
    }

    private ClaimSummaryResponse toSummary(ClaimEntity claim) {
        ClaimSummaryResponse response = new ClaimSummaryResponse();
        response.setId(claim.getId());
        response.setClaimNumber(claim.getClaimNumber());
        response.setStatus(claim.getStatus());
        response.setPolicyId(claim.getPolicyId());
        response.setAmount(claim.getClaimedAmount());
        response.setCurrency(claim.getCurrency());
        response.setDescription(claim.getDescription());
        response.setSubmittedAt(claim.getSubmittedAt());

        policyRepository.findById(claim.getPolicyId()).ifPresent(policy ->
                response.setPolicyNumber(policy.getPolicyNumber()));

        profileRepository.findById(claim.getCitizenProfileId()).ifPresent(profile ->
                userRepository.findById(profile.getUserId()).ifPresent(user ->
                        response.setClaimantName(user.getFirstName() + " " + user.getLastName())));

        return response;
    }

    private void publishAudit(UUID actorId, String action, UUID claimId) {
        eventPublisher.publishEvent(new AuditEvent(
                this, action, actorId, "CLAIM", claimId, action, null, null));
    }
}
