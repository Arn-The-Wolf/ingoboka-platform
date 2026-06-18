package rw.ingoboka.admin.application.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.admin.api.dto.request.UpdateOrganizationSettingsRequest;
import rw.ingoboka.admin.api.dto.response.OrganizationSettingsResponse;
import rw.ingoboka.shared.exception.NotFoundException;
import rw.ingoboka.shared.infrastructure.persistence.entity.OrganizationEntity;
import rw.ingoboka.shared.infrastructure.persistence.repository.OrganizationRepository;

@Service
@RequiredArgsConstructor
public class InsurerSettingsService {

    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public OrganizationSettingsResponse getSettings(UUID organizationId) {
        OrganizationEntity org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("Organization", organizationId));
        return toResponse(org);
    }

    @Transactional
    public OrganizationSettingsResponse updateSettings(UUID organizationId, UpdateOrganizationSettingsRequest request) {
        OrganizationEntity org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("Organization", organizationId));
        if (request.getContactEmail() != null) {
            org.setContactEmail(request.getContactEmail());
        }
        if (request.getContactPhone() != null) {
            org.setContactPhone(request.getContactPhone());
        }
        if (request.getSettings() != null) {
            if (org.getSettings() == null) {
                org.setSettings(new HashMap<>());
            }
            org.getSettings().putAll(request.getSettings());
        }
        return toResponse(organizationRepository.save(org));
    }

    private OrganizationSettingsResponse toResponse(OrganizationEntity org) {
        return OrganizationSettingsResponse.builder()
                .organizationId(org.getId())
                .name(org.getName())
                .contactEmail(org.getContactEmail())
                .contactPhone(org.getContactPhone())
                .settings(org.getSettings() != null ? org.getSettings() : Map.of())
                .build();
    }
}
