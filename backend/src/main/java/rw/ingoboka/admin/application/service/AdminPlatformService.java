package rw.ingoboka.admin.application.service;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.admin.api.dto.response.OrganizationResponse;
import rw.ingoboka.admin.api.dto.response.PlatformOverviewResponse;
import rw.ingoboka.shared.exception.NotFoundException;
import rw.ingoboka.shared.infrastructure.persistence.entity.OrganizationEntity;
import rw.ingoboka.shared.infrastructure.persistence.repository.OrganizationRepository;

@Service
@RequiredArgsConstructor
public class AdminPlatformService {

    private final OrganizationRepository organizationRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<OrganizationResponse> listOrganizations() {
        return organizationRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization(UUID id) {
        OrganizationEntity org = organizationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Organization", id));
        return toResponse(org);
    }

    @Transactional(readOnly = true)
    public PlatformOverviewResponse getPlatformOverview() {
        Long orgs = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM organizations", Long.class);
        Long users = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'", Long.class);
        Long policies = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM policies WHERE status = 'ACTIVE'", Long.class);
        Long claims = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM claims WHERE status IN ('SUBMITTED','UNDER_REVIEW','ADDITIONAL_INFO_REQUIRED')",
                Long.class);
        Long applications = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM policy_applications", Long.class);

        return PlatformOverviewResponse.builder()
                .organizations(orgs != null ? orgs : 0)
                .activeUsers(users != null ? users : 0)
                .activePolicies(policies != null ? policies : 0)
                .openClaims(claims != null ? claims : 0)
                .totalApplications(applications != null ? applications : 0)
                .build();
    }

    private OrganizationResponse toResponse(OrganizationEntity org) {
        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .slug(org.getSlug())
                .organizationType(org.getOrganizationType())
                .status(org.getStatus())
                .contactEmail(org.getContactEmail())
                .build();
    }
}
