package rw.ingoboka.policy.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import rw.ingoboka.shared.domain.BaseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "policies")
@Getter
@Setter
public class PolicyEntity extends BaseEntity {

    @Column(name = "policy_number", nullable = false, unique = true)
    private String policyNumber;

    @Column(name = "application_id")
    private UUID applicationId;

    @Column(name = "citizen_profile_id", nullable = false)
    private UUID citizenProfileId;

    @Column(name = "product_plan_id", nullable = false)
    private UUID productPlanId;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false)
    private String status;

    @Column(name = "coverage_start_date", nullable = false)
    private LocalDate coverageStartDate;

    @Column(name = "coverage_end_date")
    private LocalDate coverageEndDate;

    @Column(name = "premium_amount", nullable = false)
    private BigDecimal premiumAmount;

    @Column(nullable = false)
    private String currency = "RWF";

    @Column(name = "next_billing_date")
    private LocalDate nextBillingDate;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;
}
