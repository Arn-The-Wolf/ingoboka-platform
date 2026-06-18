package rw.ingoboka.product.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import rw.ingoboka.shared.domain.BaseEntity;

@Entity
@Table(name = "product_benefits")
@Getter
@Setter
public class ProductBenefitEntity extends BaseEntity {

    @Column(name = "product_version_id", nullable = false)
    private UUID productVersionId;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "benefit_type", nullable = false)
    private String benefitType = "OTHER";

    @Column(name = "coverage_amount")
    private BigDecimal coverageAmount;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
