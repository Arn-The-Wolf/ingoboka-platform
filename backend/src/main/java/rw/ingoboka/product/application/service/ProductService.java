package rw.ingoboka.product.application.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.product.application.dto.CreateProductRequest;
import rw.ingoboka.product.application.dto.ProductDetailResponse;
import rw.ingoboka.product.application.dto.ProductSummaryResponse;
import rw.ingoboka.product.infrastructure.persistence.InsurerEntity;
import rw.ingoboka.product.infrastructure.persistence.InsurerRepository;
import rw.ingoboka.product.infrastructure.persistence.ProductCoverageEntity;
import rw.ingoboka.product.infrastructure.persistence.ProductCoverageRepository;
import rw.ingoboka.product.infrastructure.persistence.ProductEntity;
import rw.ingoboka.product.infrastructure.persistence.ProductEntity.ProductStatus;
import rw.ingoboka.product.infrastructure.persistence.ProductPremiumEntity;
import rw.ingoboka.product.infrastructure.persistence.ProductPremiumRepository;
import rw.ingoboka.product.infrastructure.persistence.ProductRepository;
import rw.ingoboka.product.infrastructure.persistence.ProductVersionEntity;
import rw.ingoboka.product.infrastructure.persistence.ProductVersionRepository;
import rw.ingoboka.shared.exception.BadRequestException;
import rw.ingoboka.shared.exception.ConflictException;
import rw.ingoboka.shared.exception.NotFoundException;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final InsurerRepository insurerRepository;
    private final ProductRepository productRepository;
    private final ProductVersionRepository productVersionRepository;
    private final ProductCoverageRepository productCoverageRepository;
    private final ProductPremiumRepository productPremiumRepository;

    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> listPublishedProducts() {
        return productRepository.findByStatusOrderByNameAsc(ProductStatus.PUBLISHED).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getProductDetail(UUID productId) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product", productId));
        if (product.getStatus() != ProductStatus.PUBLISHED) {
            throw new NotFoundException("Product", productId);
        }
        return toDetail(product);
    }

    @Transactional
    public ProductDetailResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsByCode(request.code())) {
            throw new ConflictException("Product code already exists: " + request.code());
        }
        InsurerEntity insurer = insurerRepository.findById(request.insurerId())
                .orElseThrow(() -> new NotFoundException("Insurer", request.insurerId()));

        ProductEntity product = new ProductEntity();
        product.setInsurerId(insurer.getId());
        product.setCode(request.code());
        product.setName(request.name());
        product.setCategory(request.category());
        product.setDescription(request.description());
        product.setStatus(ProductStatus.DRAFT);
        product = productRepository.save(product);

        ProductVersionEntity version = new ProductVersionEntity();
        version.setProductId(product.getId());
        version.setVersionNumber(1);
        version.setTermsSummary(request.termsSummary());
        version.setEffectiveFrom(request.effectiveFrom());
        version.setCurrent(true);
        version = productVersionRepository.save(version);

        for (CreateProductRequest.CoverageRequest coverageRequest : request.coverages()) {
            ProductCoverageEntity coverage = new ProductCoverageEntity();
            coverage.setProductVersionId(version.getId());
            coverage.setCoverageCode(coverageRequest.coverageCode());
            coverage.setName(coverageRequest.name());
            coverage.setDescription(coverageRequest.description());
            coverage.setCoverageLimit(coverageRequest.coverageLimit());
            coverage.setDeductible(coverageRequest.deductible());
            productCoverageRepository.save(coverage);
        }

        for (CreateProductRequest.PremiumRequest premiumRequest : request.premiums()) {
            ProductPremiumEntity premium = new ProductPremiumEntity();
            premium.setProductVersionId(version.getId());
            premium.setBillingFrequency(premiumRequest.billingFrequency());
            premium.setPremiumAmount(premiumRequest.premiumAmount());
            premium.setCurrency(premiumRequest.currency());
            productPremiumRepository.save(premium);
        }

        product.setInsurerId(insurer.getId());
        return toDetail(product);
    }

    @Transactional
    public ProductDetailResponse publishProduct(UUID productId) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product", productId));
        if (product.getStatus() == ProductStatus.PUBLISHED) {
            throw new BadRequestException("Product is already published");
        }
        if (product.getStatus() == ProductStatus.ARCHIVED) {
            throw new BadRequestException("Archived products cannot be published");
        }
        productVersionRepository.findByProductIdAndCurrentTrue(product.getId())
                .orElseThrow(() -> new BadRequestException("Product must have a current version before publishing"));

        product.setStatus(ProductStatus.PUBLISHED);
        product.setPublishedAt(Instant.now());
        return toDetail(productRepository.save(product));
    }

    private ProductSummaryResponse toSummary(ProductEntity product) {
        String insurerName = insurerRepository.findById(product.getInsurerId())
                .map(InsurerEntity::getName)
                .orElse("Unknown");
        return new ProductSummaryResponse(
                product.getId(),
                product.getCode(),
                product.getName(),
                product.getCategory(),
                product.getDescription(),
                product.getStatus(),
                insurerName,
                product.getPublishedAt());
    }

    private ProductDetailResponse toDetail(ProductEntity product) {
        String insurerName = insurerRepository.findById(product.getInsurerId())
                .map(InsurerEntity::getName)
                .orElse("Unknown");
        ProductVersionEntity version = productVersionRepository.findByProductIdAndCurrentTrue(product.getId())
                .orElse(null);

        ProductDetailResponse.ProductVersionResponse versionResponse = null;
        if (version != null) {
            List<ProductDetailResponse.CoverageResponse> coverages = productCoverageRepository
                    .findByProductVersionIdOrderByNameAsc(version.getId()).stream()
                    .map(c -> new ProductDetailResponse.CoverageResponse(
                            c.getId(),
                            c.getCoverageCode(),
                            c.getName(),
                            c.getDescription(),
                            c.getCoverageLimit(),
                            c.getDeductible()))
                    .toList();
            List<ProductDetailResponse.PremiumResponse> premiums = productPremiumRepository
                    .findByProductVersionIdOrderByBillingFrequencyAsc(version.getId()).stream()
                    .map(p -> new ProductDetailResponse.PremiumResponse(
                            p.getId(),
                            p.getBillingFrequency(),
                            p.getPremiumAmount(),
                            p.getCurrency()))
                    .toList();
            versionResponse = new ProductDetailResponse.ProductVersionResponse(
                    version.getId(),
                    version.getVersionNumber(),
                    version.getTermsSummary(),
                    version.getEffectiveFrom(),
                    version.getEffectiveTo(),
                    coverages,
                    premiums);
        }

        return new ProductDetailResponse(
                product.getId(),
                product.getCode(),
                product.getName(),
                product.getCategory(),
                product.getDescription(),
                product.getStatus(),
                insurerName,
                product.getPublishedAt(),
                versionResponse);
    }
}
