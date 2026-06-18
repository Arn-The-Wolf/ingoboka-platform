package rw.ingoboka.shared.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import rw.ingoboka.shared.domain.BaseEntity;

@Entity
@Table(name = "organizations")
@Getter
@Setter
public class OrganizationEntity extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "organization_type", nullable = false)
    private String organizationType;

    @Column(nullable = false)
    private String status;

    @Column(name = "contact_email")
    private String contactEmail;
}
