package rw.ingoboka.identity.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import rw.ingoboka.identity.domain.model.LanguageCode;

@Data
public class RegisterRequest {

    private String phone;

    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private LanguageCode preferredLanguage = LanguageCode.RW;
}
