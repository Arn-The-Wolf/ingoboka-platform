package rw.ingoboka.customer.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import rw.ingoboka.shared.domain.BaseEntity;

@Entity
@Table(name = "citizen_profiles")
@Getter
@Setter
public class CitizenProfileEntity extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "national_id")
    private String nationalId;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    @Column(name = "kyc_status", nullable = false)
    private String kycStatus = "PENDING";

    @Column(name = "kyc_verified_at")
    private Instant kycVerifiedAt;

    @Column(name = "kyc_rejection_reason")
    private String kycRejectionReason;

    private String district;

    private String sector;

    private String occupation;
}
