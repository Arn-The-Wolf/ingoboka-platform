package rw.ingoboka.customer.application.service;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.customer.api.dto.request.CreateDependantRequest;
import rw.ingoboka.customer.api.dto.response.DependantResponse;
import rw.ingoboka.customer.infrastructure.persistence.entity.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.entity.DependantEntity;
import rw.ingoboka.customer.infrastructure.persistence.repository.CitizenProfileRepository;
import rw.ingoboka.customer.infrastructure.persistence.repository.DependantRepository;
import rw.ingoboka.shared.exception.NotFoundException;

@Service
@RequiredArgsConstructor
public class DependantService {

    private final DependantRepository dependantRepository;
    private final CitizenProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public List<DependantResponse> listDependants(UUID userId) {
        CitizenProfileEntity profile = getProfile(userId);
        return dependantRepository.findByCitizenProfileIdAndActiveTrueOrderByCreatedAtDesc(profile.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DependantResponse addDependant(UUID userId, CreateDependantRequest request) {
        CitizenProfileEntity profile = getProfile(userId);
        DependantEntity dependant = new DependantEntity();
        dependant.setCitizenProfileId(profile.getId());
        dependant.setFirstName(request.getFirstName());
        dependant.setLastName(request.getLastName());
        dependant.setRelationship(request.getRelationship());
        dependant.setDateOfBirth(request.getDateOfBirth());
        dependant.setGender(request.getGender());
        dependant.setNationalId(request.getNationalId());
        return toResponse(dependantRepository.save(dependant));
    }

    @Transactional
    public void removeDependant(UUID userId, UUID dependantId) {
        CitizenProfileEntity profile = getProfile(userId);
        DependantEntity dependant = dependantRepository.findById(dependantId)
                .orElseThrow(() -> new NotFoundException("Dependant", dependantId));
        if (!dependant.getCitizenProfileId().equals(profile.getId())) {
            throw new NotFoundException("Dependant", dependantId);
        }
        dependant.setActive(false);
        dependantRepository.save(dependant);
    }

    private CitizenProfileEntity getProfile(UUID userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", userId));
    }

    private DependantResponse toResponse(DependantEntity entity) {
        return DependantResponse.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .relationship(entity.getRelationship())
                .dateOfBirth(entity.getDateOfBirth())
                .gender(entity.getGender())
                .active(entity.isActive())
                .build();
    }
}
