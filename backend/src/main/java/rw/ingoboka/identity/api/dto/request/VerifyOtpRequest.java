package rw.ingoboka.identity.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpRequest {

    @NotBlank
    private String phoneOrEmail;

    @NotBlank
    private String code;
}
