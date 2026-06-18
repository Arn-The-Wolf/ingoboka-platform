package rw.ingoboka.product.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import rw.ingoboka.shared.domain.BaseEntity;

@Entity
@Table(name = "product_required_documents")
@Getter
@Setter
public class ProductRequiredDocumentEntity extends BaseEntity {

    @Column(name = "product_version_id", nullable = false)
    private UUID productVersionId;

    @Column(name = "document_type", nullable = false)
    private String documentType;

    @Column(name = "is_mandatory", nullable = false)
    private boolean mandatory = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
