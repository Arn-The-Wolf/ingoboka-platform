package rw.ingoboka.enrollment.application.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.customer.infrastructure.persistence.entity.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.repository.CitizenProfileRepository;
import rw.ingoboka.enrollment.api.dto.request.CreateApplicationRequest;
import rw.ingoboka.enrollment.api.dto.request.NeedsAssessmentRequest;
import rw.ingoboka.enrollment.api.dto.request.QuoteRequest;
import rw.ingoboka.enrollment.api.dto.response.ApplicationResponse;
import rw.ingoboka.enrollment.api.dto.response.NeedsAssessmentResponse;
import rw.ingoboka.enrollment.api.dto.response.QuoteResponse;
import rw.ingoboka.enrollment.infrastructure.persistence.entity.ApplicationBeneficiaryEntity;
import rw.ingoboka.enrollment.infrastructure.persistence.entity.PolicyApplicationEntity;
import rw.ingoboka.enrollment.infrastructure.persistence.repository.ApplicationBeneficiaryRepository;
import rw.ingoboka.enrollment.infrastructure.persistence.repository.PolicyApplicationRepository;
import rw.ingoboka.identity.domain.model.UserRole;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.identity.infrastructure.persistence.repository.UserRepository;
import rw.ingoboka.product.infrastructure.persistence.entity.InsuranceProductEntity;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductBenefitEntity;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductPlanEntity;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductVersionEntity;
import rw.ingoboka.product.infrastructure.persistence.repository.InsuranceProductRepository;
import rw.ingoboka.product.infrastructure.persistence.repository.ProductBenefitRepository;
import rw.ingoboka.product.infrastructure.persistence.repository.ProductPlanRepository;
import rw.ingoboka.product.infrastructure.persistence.repository.ProductVersionRepository;
import rw.ingoboka.shared.domain.PageResponse;
import rw.ingoboka.shared.exception.BadRequestException;
import rw.ingoboka.shared.exception.NotFoundException;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final PolicyApplicationRepository applicationRepository;
    private final ApplicationBeneficiaryRepository beneficiaryRepository;
    private final CitizenProfileRepository profileRepository;
    private final ProductPlanRepository planRepository;
    private final ProductVersionRepository versionRepository;
    private final InsuranceProductRepository productRepository;
    private final ProductBenefitRepository benefitRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public NeedsAssessmentResponse assessNeeds(NeedsAssessmentRequest request) {
        int score = 50;
        if (request.getDependents() > 2) {
            score += 10;
        }
        if ("INFORMAL".equalsIgnoreCase(request.getOccupation())
                || "TRADER".equalsIgnoreCase(request.getOccupation())) {
            score += 15;
        }
        String warning = score > 70 ? null : "Consider weekly or daily premium plans for irregular income.";

        List<UUID> recommended = productRepository.findByStatusOrderByNameAsc("ACTIVE").stream()
                .map(InsuranceProductEntity::getId)
                .toList();

        return NeedsAssessmentResponse.builder()
                .score(score)
                .affordabilityWarning(warning)
                .recommendedProductIds(recommended)
                .guidance("Accident and hospital cash bundles are suitable for informal workers.")
                .build();
    }

    @Transactional(readOnly = true)
    public QuoteResponse generateQuote(QuoteRequest request) {
        PlanContext ctx = resolvePlan(request.getProductPlanId());
        String warning = null;
        if (request.getNeedsAssessment() != null
                && request.getNeedsAssessment().getIncomeRange() != null
                && request.getNeedsAssessment().getIncomeRange().contains("LOW")) {
            warning = "Premium may exceed 10% of stated income — review plan frequency.";
        }

        List<String> benefits = benefitRepository
                .findByProductVersionIdOrderBySortOrderAsc(ctx.version().getId()).stream()
                .map(ProductBenefitEntity::getName)
                .toList();

        return QuoteResponse.builder()
                .productPlanId(ctx.plan().getId())
                .productId(ctx.product().getId())
                .productName(ctx.product().getName())
                .planName(ctx.plan().getName())
                .billingFrequency(ctx.plan().getBillingFrequency())
                .premiumAmount(ctx.plan().getPremiumAmount())
                .currency(ctx.product().getCurrency())
                .affordabilityWarning(warning)
                .recommendedBenefits(benefits)
                .build();
    }

    @Transactional
    public ApplicationResponse createApplication(UUID userId, CreateApplicationRequest request) {
        CitizenProfileEntity profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", userId));
        PlanContext ctx = resolvePlan(request.getProductPlanId());

        PolicyApplicationEntity application = new PolicyApplicationEntity();
        application.setApplicationNumber(generateApplicationNumber());
        application.setCitizenProfileId(profile.getId());
        application.setProductPlanId(ctx.plan().getId());
        application.setOrganizationId(ctx.product().getOrganizationId());
        application.setPremiumAmount(ctx.plan().getPremiumAmount());
        application.setCurrency(ctx.product().getCurrency());
        application.setStatus("DRAFT");
        application.setCoverageStartDate(LocalDate.now());
        application.setCoverageEndDate(LocalDate.now().plusYears(1));
        application = applicationRepository.save(application);

        for (CreateApplicationRequest.BeneficiaryRequest beneficiaryRequest : request.getBeneficiaries()) {
            ApplicationBeneficiaryEntity beneficiary = new ApplicationBeneficiaryEntity();
            beneficiary.setApplicationId(application.getId());
            beneficiary.setFirstName(beneficiaryRequest.getFirstName());
            beneficiary.setLastName(beneficiaryRequest.getLastName());
            beneficiary.setRelationship(beneficiaryRequest.getRelationship());
            beneficiary.setAllocationPercent(
                    beneficiaryRequest.getAllocationPercent() != null
                            ? beneficiaryRequest.getAllocationPercent()
                            : BigDecimal.valueOf(100));
            beneficiaryRepository.save(beneficiary);
        }

        return toResponse(application);
    }

    @Transactional
    public ApplicationResponse submitApplication(UUID applicationId, UUID userId) {
        PolicyApplicationEntity application = getApplicationForCitizen(applicationId, userId);
        if (!"DRAFT".equals(application.getStatus())) {
            throw new BadRequestException("Only draft applications can be submitted");
        }
        application.setStatus("APPROVED");
        application.setSubmittedAt(Instant.now());
        application.setReviewedAt(Instant.now());
        application = applicationRepository.save(application);
        return toResponse(application);
    }

    @Transactional(readOnly = true)
    public PolicyApplicationEntity getApprovedApplication(UUID applicationId, UUID userId) {
        PolicyApplicationEntity application = getApplicationForCitizen(applicationId, userId);
        if (!"APPROVED".equals(application.getStatus()) && !"CONVERTED".equals(application.getStatus())) {
            throw new BadRequestException("Application must be approved before payment");
        }
        return application;
    }

    @Transactional
    public void markConverted(UUID applicationId) {
        applicationRepository.findById(applicationId).ifPresent(app -> {
            app.setStatus("CONVERTED");
            applicationRepository.save(app);
        });
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> listApplicationsForOrganization(UUID organizationId, Pageable pageable) {
        Page<PolicyApplicationEntity> page =
                applicationRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId, pageable);
        return PageResponse.from(page.map(this::toResponse));
    }

    @Transactional
    public ApplicationResponse createAssistedApplication(
            UUID agentOrganizationId, String citizenPhone, UUID productPlanId) {
        UserEntity citizen = userRepository.findByPhone(citizenPhone)
                .orElseThrow(() -> new NotFoundException("Citizen", citizenPhone));
        if (citizen.getRole() != UserRole.CITIZEN) {
            throw new BadRequestException("Phone number must belong to a registered citizen");
        }

        CitizenProfileEntity profile = profileRepository.findByUserId(citizen.getId())
                .orElseThrow(() -> new NotFoundException("Citizen profile", citizen.getId()));
        PlanContext ctx = resolvePlan(productPlanId);
        if (!ctx.product().getOrganizationId().equals(agentOrganizationId)) {
            throw new BadRequestException("Product is not available for this agent organization");
        }

        PolicyApplicationEntity application = new PolicyApplicationEntity();
        application.setApplicationNumber(generateApplicationNumber());
        application.setCitizenProfileId(profile.getId());
        application.setProductPlanId(ctx.plan().getId());
        application.setOrganizationId(ctx.product().getOrganizationId());
        application.setPremiumAmount(ctx.plan().getPremiumAmount());
        application.setCurrency(ctx.product().getCurrency());
        application.setStatus("DRAFT");
        application.setCoverageStartDate(LocalDate.now());
        application.setCoverageEndDate(LocalDate.now().plusYears(1));
        application = applicationRepository.save(application);
        return toResponse(application);
    }

    private PolicyApplicationEntity getApplicationForCitizen(UUID applicationId, UUID userId) {
        CitizenProfileEntity profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Citizen profile", userId));
        PolicyApplicationEntity application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application", applicationId));
        if (!application.getCitizenProfileId().equals(profile.getId())) {
            throw new NotFoundException("Application", applicationId);
        }
        return application;
    }

    private PlanContext resolvePlan(UUID productPlanId) {
        ProductPlanEntity plan = planRepository.findById(productPlanId)
                .orElseThrow(() -> new NotFoundException("Product plan", productPlanId));
        ProductVersionEntity version = versionRepository.findById(plan.getProductVersionId())
                .orElseThrow(() -> new NotFoundException("Product version", plan.getProductVersionId()));
        InsuranceProductEntity product = productRepository.findById(version.getProductId())
                .orElseThrow(() -> new NotFoundException("Product", version.getProductId()));
        if (!"ACTIVE".equals(product.getStatus())) {
            throw new BadRequestException("Product is not available for enrollment");
        }
        return new PlanContext(plan, version, product);
    }

    private String generateApplicationNumber() {
        return "APP-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private ApplicationResponse toResponse(PolicyApplicationEntity application) {
        return ApplicationResponse.builder()
                .id(application.getId())
                .applicationNumber(application.getApplicationNumber())
                .status(application.getStatus())
                .premiumAmount(application.getPremiumAmount())
                .currency(application.getCurrency())
                .build();
    }

    private record PlanContext(ProductPlanEntity plan, ProductVersionEntity version, InsuranceProductEntity product) {
    }
}
