package rw.ingoboka.customer.application.service;

import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.customer.application.dto.CitizenProfileResponse;
import rw.ingoboka.customer.application.dto.CreateProfileRequest;
import rw.ingoboka.customer.application.dto.DataRequestRequest;
import rw.ingoboka.customer.application.dto.DataRequestResponse;
import rw.ingoboka.customer.application.dto.RecordConsentRequest;
import rw.ingoboka.customer.application.dto.UpdateProfileRequest;
import rw.ingoboka.customer.infrastructure.persistence.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.CitizenProfileRepository;
import rw.ingoboka.customer.infrastructure.persistence.ConsentEntity;
import rw.ingoboka.customer.infrastructure.persistence.ConsentRepository;
import rw.ingoboka.customer.infrastructure.persistence.DataRequestEntity;
import rw.ingoboka.customer.infrastructure.persistence.DataRequestRepository;
import rw.ingoboka.shared.exception.BadRequestException;
import rw.ingoboka.shared.exception.ConflictException;
import rw.ingoboka.shared.exception.NotFoundException;
import rw.ingoboka.shared.security.SecurityUtils;

@Service
@RequiredArgsConstructor
public class CustomerProfileService {

    private final CitizenProfileRepository profileRepository;
    private final ConsentRepository consentRepository;
    private final DataRequestRepository dataRequestRepository;

    @Transactional
    public CitizenProfileResponse createProfile(CreateProfileRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (profileRepository.existsByUserId(userId)) {
            throw new ConflictException("Citizen profile already exists for this user");
        }
        if (request.nationalId() != null && profileRepository.existsByNationalId(request.nationalId())) {
            throw new ConflictException("National ID is already registered");
        }

        CitizenProfileEntity profile = new CitizenProfileEntity();
        profile.setUserId(userId);
        applyCreateRequest(profile, request);
        return toResponse(profileRepository.save(profile));
    }

    @Transactional
    public CitizenProfileResponse updateProfile(UpdateProfileRequest request) {
        CitizenProfileEntity profile = getProfileForCurrentUser();
        if (request.nationalId() != null
                && !request.nationalId().equals(profile.getNationalId())
                && profileRepository.existsByNationalId(request.nationalId())) {
            throw new ConflictException("National ID is already registered");
        }
        applyUpdateRequest(profile, request);
        return toResponse(profileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public CitizenProfileResponse getProfile() {
        return toResponse(getProfileForCurrentUser());
    }

    @Transactional
    public void recordConsent(RecordConsentRequest request, String ipAddress) {
        CitizenProfileEntity profile = getProfileForCurrentUser();
        ConsentEntity consent = new ConsentEntity();
        consent.setProfileId(profile.getId());
        consent.setConsentType(request.consentType());
        consent.setGranted(request.granted());
        consent.setConsentVersion(request.consentVersion());
        consent.setIpAddress(ipAddress);
        consent.setRecordedAt(Instant.now());
        consentRepository.save(consent);
    }

    @Transactional
    public DataRequestResponse submitDataRequest(DataRequestRequest request) {
        CitizenProfileEntity profile = getProfileForCurrentUser();
        DataRequestEntity dataRequest = new DataRequestEntity();
        dataRequest.setProfileId(profile.getId());
        dataRequest.setRequestType(request.requestType());
        dataRequest.setDetails(request.details());
        dataRequest.setStatus(DataRequestEntity.RequestStatus.PENDING);
        DataRequestEntity saved = dataRequestRepository.save(dataRequest);
        return toDataRequestResponse(saved);
    }

    private CitizenProfileEntity getProfileForCurrentUser() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", userId));
    }

    private void applyCreateRequest(CitizenProfileEntity profile, CreateProfileRequest request) {
        profile.setNationalId(request.nationalId());
        profile.setDateOfBirth(request.dateOfBirth());
        profile.setGender(request.gender());
        profile.setDistrict(request.district());
        profile.setSector(request.sector());
        profile.setCell(request.cell());
        profile.setVillage(request.village());
        if (request.preferredLanguage() != null) {
            profile.setPreferredLanguage(request.preferredLanguage());
        }
        profile.setEmergencyContactName(request.emergencyContactName());
        profile.setEmergencyContactPhone(request.emergencyContactPhone());
    }

    private void applyUpdateRequest(CitizenProfileEntity profile, UpdateProfileRequest request) {
        if (request.nationalId() != null) {
            profile.setNationalId(request.nationalId());
        }
        if (request.dateOfBirth() != null) {
            profile.setDateOfBirth(request.dateOfBirth());
        }
        if (request.gender() != null) {
            profile.setGender(request.gender());
        }
        if (request.district() != null) {
            profile.setDistrict(request.district());
        }
        if (request.sector() != null) {
            profile.setSector(request.sector());
        }
        if (request.cell() != null) {
            profile.setCell(request.cell());
        }
        if (request.village() != null) {
            profile.setVillage(request.village());
        }
        if (request.preferredLanguage() != null) {
            profile.setPreferredLanguage(request.preferredLanguage());
        }
        if (request.emergencyContactName() != null) {
            profile.setEmergencyContactName(request.emergencyContactName());
        }
        if (request.emergencyContactPhone() != null) {
            profile.setEmergencyContactPhone(request.emergencyContactPhone());
        }
    }

    private CitizenProfileResponse toResponse(CitizenProfileEntity profile) {
        return new CitizenProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getNationalId(),
                profile.getDateOfBirth(),
                profile.getGender(),
                profile.getDistrict(),
                profile.getSector(),
                profile.getCell(),
                profile.getVillage(),
                profile.getPreferredLanguage(),
                profile.getEmergencyContactName(),
                profile.getEmergencyContactPhone(),
                profile.getCreatedAt(),
                profile.getUpdatedAt());
    }

    private DataRequestResponse toDataRequestResponse(DataRequestEntity entity) {
        return new DataRequestResponse(
                entity.getId(),
                entity.getProfileId(),
                entity.getRequestType(),
                entity.getStatus(),
                entity.getDetails(),
                entity.getCreatedAt(),
                entity.getResolvedAt());
    }
}
