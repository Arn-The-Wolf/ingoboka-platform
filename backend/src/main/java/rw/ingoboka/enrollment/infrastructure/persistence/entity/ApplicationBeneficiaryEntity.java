package rw.ingoboka.enrollment.infrastructure.persistence.entity;

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
@Table(name = "application_beneficiaries")
@Getter
@Setter
public class ApplicationBeneficiaryEntity extends BaseEntity {

    @Column(name = "application_id", nullable = false)
    private UUID applicationId;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 50)
    private String relationship;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "national_id", length = 20)
    private String nationalId;

    @Column(name = "allocation_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal allocationPercent = BigDecimal.valueOf(100);

    @Column(length = 20)
    private String phone;
}
