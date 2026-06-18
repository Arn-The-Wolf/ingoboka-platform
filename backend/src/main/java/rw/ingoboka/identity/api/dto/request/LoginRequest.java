package rw.ingoboka.identity.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank
    private String phoneOrEmail;

    @NotBlank
    private String password;
}
