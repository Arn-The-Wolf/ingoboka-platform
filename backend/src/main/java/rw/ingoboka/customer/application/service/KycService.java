package rw.ingoboka.customer.application.service;

import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.customer.api.dto.request.KycReviewRequest;
import rw.ingoboka.customer.api.dto.response.CitizenProfileResponse;
import rw.ingoboka.customer.infrastructure.persistence.entity.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.repository.CitizenProfileRepository;
import rw.ingoboka.shared.exception.BadRequestException;
import rw.ingoboka.shared.exception.NotFoundException;

@Service
@RequiredArgsConstructor
public class KycService {

    private final CitizenProfileRepository profileRepository;
    private final CustomerProfileService customerProfileService;

    @Transactional
    public CitizenProfileResponse submitForReview(UUID userId) {
        CitizenProfileEntity profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", userId));
        if ("VERIFIED".equals(profile.getKycStatus())) {
            throw new BadRequestException("KYC is already verified");
        }
        profile.setKycStatus("MANUAL_REVIEW");
        profileRepository.save(profile);
        return customerProfileService.getProfile(userId);
    }

    @Transactional
    public CitizenProfileResponse reviewKyc(UUID profileId, KycReviewRequest request) {
        CitizenProfileEntity profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", profileId));
        String status = request.getStatus().toUpperCase();
        if (!"VERIFIED".equals(status) && !"REJECTED".equals(status)) {
            throw new BadRequestException("Status must be VERIFIED or REJECTED");
        }
        profile.setKycStatus(status);
        if ("VERIFIED".equals(status)) {
            profile.setKycVerifiedAt(Instant.now());
            profile.setKycRejectionReason(null);
        } else {
            profile.setKycRejectionReason(request.getRejectionReason());
            profile.setKycVerifiedAt(null);
        }
        profileRepository.save(profile);
        return customerProfileService.getProfile(profile.getUserId());
    }
}
