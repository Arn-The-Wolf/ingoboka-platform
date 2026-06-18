package rw.ingoboka.agent.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Data;

@Data
public class AssistedApplicationRequest {

    @NotBlank
    private String citizenPhone;

    @NotNull
    private UUID productPlanId;
}
