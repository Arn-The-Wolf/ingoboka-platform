package rw.ingoboka.product.application.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.product.api.dto.request.CreateProductRequest;
import rw.ingoboka.product.api.dto.response.ProductDetailResponse;
import rw.ingoboka.product.api.dto.response.ProductPlanResponse;
import rw.ingoboka.product.api.dto.response.ProductResponse;
import rw.ingoboka.product.api.dto.response.ProductSummaryResponse;
import rw.ingoboka.product.infrastructure.persistence.entity.InsuranceProductEntity;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductBenefitEntity;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductExclusionEntity;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductPlanEntity;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductRequiredDocumentEntity;
import rw.ingoboka.product.infrastructure.persistence.entity.ProductVersionEntity;
import rw.ingoboka.product.infrastructure.persistence.repository.InsuranceProductRepository;
import rw.ingoboka.product.infrastructure.persistence.repository.ProductBenefitRepository;
import rw.ingoboka.product.infrastructure.persistence.repository.ProductExclusionRepository;
import rw.ingoboka.product.infrastructure.persistence.repository.ProductPlanRepository;
import rw.ingoboka.product.infrastructure.persistence.repository.ProductRequiredDocumentRepository;
import rw.ingoboka.product.infrastructure.persistence.repository.ProductVersionRepository;
import rw.ingoboka.shared.domain.PageResponse;
import rw.ingoboka.shared.exception.BadRequestException;
import rw.ingoboka.shared.exception.ConflictException;
import rw.ingoboka.shared.exception.NotFoundException;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String VERSION_PUBLISHED = "PUBLISHED";

    private final InsuranceProductRepository productRepository;
    private final ProductVersionRepository versionRepository;
    private final ProductPlanRepository planRepository;
    private final ProductBenefitRepository benefitRepository;
    private final ProductExclusionRepository exclusionRepository;
    private final ProductRequiredDocumentRepository documentRepository;

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> listPublishedProducts(Pageable pageable) {
        Page<InsuranceProductEntity> page = productRepository.findByStatus(STATUS_ACTIVE, pageable);
        return PageResponse.from(page.map(this::toSummary));
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listOrganizationProducts(UUID organizationId, Pageable pageable) {
        Page<InsuranceProductEntity> page =
                productRepository.findByOrganizationIdOrderByNameAsc(organizationId, pageable);
        return PageResponse.from(page.map(p -> ProductResponse.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .status(p.getStatus())
                .build()));
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getProductDetail(UUID productId) {
        InsuranceProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product", productId));
        if (!STATUS_ACTIVE.equals(product.getStatus())) {
            throw new NotFoundException("Product", productId);
        }
        return toDetail(product);
    }

    @Transactional
    public ProductResponse createProduct(UUID organizationId, CreateProductRequest request) {
        if (productRepository.existsByOrganizationIdAndCode(organizationId, request.getCode())) {
            throw new ConflictException("Product code already exists: " + request.getCode());
        }

        InsuranceProductEntity product = new InsuranceProductEntity();
        product.setOrganizationId(organizationId);
        product.setCode(request.getCode());
        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setDescription(request.getDescription());
        product.setStatus(STATUS_DRAFT);
        product = productRepository.save(product);

        ProductVersionEntity version = new ProductVersionEntity();
        version.setProductId(product.getId());
        version.setVersionNumber(1);
        version.setEffectiveFrom(request.getEffectiveFrom());
        version.setTermsSummary(request.getTermsSummary());
        version.setStatus("DRAFT");
        version = versionRepository.save(version);

        for (CreateProductRequest.PlanRequest planRequest : request.getPlans()) {
            ProductPlanEntity plan = new ProductPlanEntity();
            plan.setProductVersionId(version.getId());
            plan.setCode(planRequest.getCode());
            plan.setName(planRequest.getName());
            plan.setBillingFrequency(planRequest.getBillingFrequency());
            plan.setPremiumAmount(planRequest.getPremiumAmount());
            plan.setSumAssured(planRequest.getSumAssured());
            plan.setDefault(planRequest.isDefault());
            planRepository.save(plan);
        }

        for (CreateProductRequest.BenefitRequest benefitRequest : request.getBenefits()) {
            ProductBenefitEntity benefit = new ProductBenefitEntity();
            benefit.setProductVersionId(version.getId());
            benefit.setCode(benefitRequest.getBenefitCode());
            benefit.setName(benefitRequest.getName());
            benefit.setDescription(benefitRequest.getDescription());
            benefit.setCoverageAmount(benefitRequest.getCoverageLimit());
            benefit.setBenefitType("OTHER");
            benefit.setSortOrder(benefitRequest.getSortOrder());
            benefitRepository.save(benefit);
        }

        for (CreateProductRequest.ExclusionRequest exclusionRequest : request.getExclusions()) {
            ProductExclusionEntity exclusion = new ProductExclusionEntity();
            exclusion.setProductVersionId(version.getId());
            exclusion.setCode(exclusionRequest.getExclusionCode());
            exclusion.setTitle(exclusionRequest.getName());
            exclusion.setDescription(exclusionRequest.getDescription() != null
                    ? exclusionRequest.getDescription()
                    : exclusionRequest.getName());
            exclusion.setSortOrder(exclusionRequest.getSortOrder());
            exclusionRepository.save(exclusion);
        }

        for (CreateProductRequest.DocumentRequest documentRequest : request.getRequiredDocuments()) {
            ProductRequiredDocumentEntity document = new ProductRequiredDocumentEntity();
            document.setProductVersionId(version.getId());
            document.setDocumentType(documentRequest.getDocumentCode());
            document.setMandatory(documentRequest.isMandatory());
            document.setDescription(documentRequest.getDescription() != null
                    ? documentRequest.getDescription()
                    : documentRequest.getName());
            document.setSortOrder(documentRequest.getSortOrder());
            documentRepository.save(document);
        }

        product.setCurrentVersionId(version.getId());
        productRepository.save(product);

        return ProductResponse.builder()
                .id(product.getId())
                .code(product.getCode())
                .name(product.getName())
                .status(product.getStatus())
                .build();
    }

    @Transactional
    public void publishProduct(UUID productId, UUID publishedBy) {
        InsuranceProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product", productId));
        if (STATUS_ACTIVE.equals(product.getStatus())) {
            throw new BadRequestException("Product is already published");
        }
        ProductVersionEntity version = versionRepository.findByProductIdAndStatus(productId, VERSION_PUBLISHED)
                .or(() -> versionRepository.findById(product.getCurrentVersionId()))
                .orElseThrow(() -> new BadRequestException("Product must have a version before publishing"));

        version.setStatus(VERSION_PUBLISHED);
        version.setPublishedAt(LocalDateTime.now());
        version.setPublishedBy(publishedBy);
        versionRepository.save(version);

        product.setStatus(STATUS_ACTIVE);
        product.setCurrentVersionId(version.getId());
        productRepository.save(product);
    }

    private ProductSummaryResponse toSummary(InsuranceProductEntity product) {
        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .category(product.getCategory())
                .description(product.getDescription())
                .currency(product.getCurrency())
                .startingPremium(resolveStartingPremium(product))
                .build();
    }

    private ProductDetailResponse toDetail(InsuranceProductEntity product) {
        ProductVersionEntity version = versionRepository.findById(product.getCurrentVersionId())
                .orElseThrow(() -> new NotFoundException("Product version", product.getCurrentVersionId()));

        List<ProductPlanResponse> plans = planRepository.findByProductVersionIdOrderByPremiumAmountAsc(version.getId())
                .stream()
                .map(p -> ProductPlanResponse.builder()
                        .id(p.getId())
                        .code(p.getCode())
                        .name(p.getName())
                        .billingFrequency(p.getBillingFrequency())
                        .premiumAmount(p.getPremiumAmount())
                        .build())
                .toList();

        List<ProductDetailResponse.BenefitResponse> benefits = benefitRepository
                .findByProductVersionIdOrderBySortOrderAsc(version.getId()).stream()
                .map(b -> ProductDetailResponse.BenefitResponse.builder()
                        .id(b.getId())
                        .benefitCode(b.getCode())
                        .name(b.getName())
                        .description(b.getDescription())
                        .coverageLimit(b.getCoverageAmount())
                        .build())
                .toList();

        List<ProductDetailResponse.ExclusionResponse> exclusions = exclusionRepository
                .findByProductVersionIdOrderBySortOrderAsc(version.getId()).stream()
                .map(e -> ProductDetailResponse.ExclusionResponse.builder()
                        .id(e.getId())
                        .exclusionCode(e.getCode())
                        .name(e.getTitle())
                        .description(e.getDescription())
                        .build())
                .toList();

        List<ProductDetailResponse.RequiredDocumentResponse> documents = documentRepository
                .findByProductVersionIdOrderBySortOrderAsc(version.getId()).stream()
                .map(d -> ProductDetailResponse.RequiredDocumentResponse.builder()
                        .id(d.getId())
                        .documentCode(d.getDocumentType())
                        .name(d.getDocumentType())
                        .description(d.getDescription())
                        .mandatory(d.isMandatory())
                        .build())
                .toList();

        return ProductDetailResponse.builder()
                .id(product.getId())
                .code(product.getCode())
                .name(product.getName())
                .category(product.getCategory())
                .description(product.getDescription())
                .termsSummary(version.getTermsSummary())
                .currency(product.getCurrency())
                .plans(plans)
                .benefits(benefits)
                .exclusions(exclusions)
                .requiredDocuments(documents)
                .build();
    }

    private java.math.BigDecimal resolveStartingPremium(InsuranceProductEntity product) {
        if (product.getCurrentVersionId() == null) {
            return null;
        }
        return planRepository.findByProductVersionIdOrderByPremiumAmountAsc(product.getCurrentVersionId())
                .stream()
                .findFirst()
                .map(ProductPlanEntity::getPremiumAmount)
                .orElse(null);
    }
}
