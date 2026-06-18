package rw.ingoboka.identity.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResendOtpRequest {

    @NotBlank
    private String phoneOrEmail;
}
