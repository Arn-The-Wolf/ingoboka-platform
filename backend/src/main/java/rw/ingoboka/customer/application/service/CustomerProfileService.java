package rw.ingoboka.customer.application.service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import rw.ingoboka.customer.api.dto.request.CreateProfileRequest;
import rw.ingoboka.customer.api.dto.request.DataRequestRequest;
import rw.ingoboka.customer.api.dto.request.RecordConsentRequest;
import rw.ingoboka.customer.api.dto.request.UpdateProfileRequest;
import rw.ingoboka.customer.api.dto.response.CitizenProfileResponse;
import rw.ingoboka.customer.api.dto.response.ConsentResponse;
import rw.ingoboka.customer.api.dto.response.DataRequestResponse;
import rw.ingoboka.customer.infrastructure.persistence.entity.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.entity.ConsentEntity;
import rw.ingoboka.customer.infrastructure.persistence.entity.DataRequestEntity;
import rw.ingoboka.customer.infrastructure.persistence.repository.CitizenProfileRepository;
import rw.ingoboka.customer.infrastructure.persistence.repository.ConsentRepository;
import rw.ingoboka.customer.infrastructure.persistence.repository.DataRequestRepository;
import rw.ingoboka.shared.exception.ConflictException;
import rw.ingoboka.shared.exception.NotFoundException;

@Service
@RequiredArgsConstructor
public class CustomerProfileService {

    private final CitizenProfileRepository profileRepository;
    private final ConsentRepository consentRepository;
    private final DataRequestRepository dataRequestRepository;

    @Transactional
    public CitizenProfileResponse createProfile(UUID userId, CreateProfileRequest request) {
        if (profileRepository.existsByUserId(userId)) {
            throw new ConflictException("Citizen profile already exists for this user");
        }
        if (request.getNationalId() != null && profileRepository.existsByNationalId(request.getNationalId())) {
            throw new ConflictException("National ID is already registered");
        }

        CitizenProfileEntity profile = new CitizenProfileEntity();
        profile.setUserId(userId);
        profile.setNationalId(request.getNationalId());
        profile.setDistrict(request.getDistrict());
        profile.setOccupation(request.getOccupation());
        profile.setGender(request.getGender());
        profile.setKycStatus("PENDING");
        return toResponse(profileRepository.save(profile));
    }

    @Transactional
    public CitizenProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        CitizenProfileEntity profile = getProfileEntity(userId);
        if (request.getDistrict() != null) {
            profile.setDistrict(request.getDistrict());
        }
        if (request.getSector() != null) {
            profile.setSector(request.getSector());
        }
        if (request.getOccupation() != null) {
            profile.setOccupation(request.getOccupation());
        }
        return toResponse(profileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public CitizenProfileResponse getProfile(UUID userId) {
        return toResponse(getProfileEntity(userId));
    }

    @Transactional
    public void recordConsent(UUID userId, RecordConsentRequest request) {
        CitizenProfileEntity profile = getProfileEntity(userId);
        ConsentEntity consent = new ConsentEntity();
        consent.setCitizenProfileId(profile.getId());
        consent.setConsentType(request.getConsentType());
        consent.setConsentVersion(request.getVersionRef());
        consent.setGranted(request.isGranted());
        consent.setGrantedAt(LocalDateTime.now());
        consent.setIpAddress(resolveClientIp());
        consent.setUserAgent(resolveUserAgent());
        if (!request.isGranted()) {
            consent.setRevokedAt(LocalDateTime.now());
        }
        consentRepository.save(consent);
    }

    @Transactional(readOnly = true)
    public List<ConsentResponse> getConsents(UUID userId) {
        CitizenProfileEntity profile = getProfileEntity(userId);
        return consentRepository.findByCitizenProfileIdOrderByGrantedAtDesc(profile.getId()).stream()
                .map(this::toConsentResponse)
                .toList();
    }

    @Transactional
    public DataRequestResponse submitDataRequest(UUID userId, DataRequestRequest request) {
        CitizenProfileEntity profile = getProfileEntity(userId);
        DataRequestEntity dataRequest = new DataRequestEntity();
        dataRequest.setCitizenProfileId(profile.getId());
        dataRequest.setRequestType(request.getRequestType());
        dataRequest.setDetails(request.getDetails());
        dataRequest.setStatus(DataRequestEntity.RequestStatus.PENDING);
        return toDataRequestResponse(dataRequestRepository.save(dataRequest));
    }

    private CitizenProfileEntity getProfileEntity(UUID userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", userId));
    }

    private CitizenProfileResponse toResponse(CitizenProfileEntity profile) {
        return CitizenProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .nationalId(profile.getNationalId())
                .district(profile.getDistrict())
                .sector(profile.getSector())
                .occupation(profile.getOccupation())
                .kycStatus(profile.getKycStatus())
                .build();
    }

    private ConsentResponse toConsentResponse(ConsentEntity consent) {
        return ConsentResponse.builder()
                .id(consent.getId())
                .consentType(consent.getConsentType())
                .consentVersion(consent.getConsentVersion())
                .granted(consent.isGranted())
                .grantedAt(consent.getGrantedAt())
                .revokedAt(consent.getRevokedAt())
                .build();
    }

    private DataRequestResponse toDataRequestResponse(DataRequestEntity entity) {
        return DataRequestResponse.builder()
                .id(entity.getId())
                .requestType(entity.getRequestType())
                .status(entity.getStatus())
                .details(entity.getDetails())
                .createdAt(entity.getCreatedAt())
                .resolvedAt(entity.getResolvedAt())
                .build();
    }

    private String resolveClientIp() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return null;
        }
        HttpServletRequest httpRequest = attributes.getRequest();
        String forwarded = httpRequest.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return httpRequest.getRemoteAddr();
    }

    private String resolveUserAgent() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return null;
        }
        return attributes.getRequest().getHeader("User-Agent");
    }
}
