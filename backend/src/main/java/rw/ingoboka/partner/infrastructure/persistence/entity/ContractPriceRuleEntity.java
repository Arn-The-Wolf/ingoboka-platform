package rw.ingoboka.partner.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import rw.ingoboka.shared.domain.BaseEntity;

@Entity
@Table(name = "contract_price_rules")
@Getter
@Setter
public class ContractPriceRuleEntity extends BaseEntity {

    @Column(name = "contract_id", nullable = false)
    private UUID contractId;

    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "rule_type", nullable = false, length = 50)
    private String ruleType;

    @Column(name = "rate_value", nullable = false, precision = 14, scale = 4)
    private BigDecimal rateValue;

    @Column(nullable = false, length = 3)
    private String currency = "RWF";

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;
}
