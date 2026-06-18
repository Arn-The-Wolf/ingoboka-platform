package rw.ingoboka.product.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateProductRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    private String description;
    private UUID organizationId;
}
