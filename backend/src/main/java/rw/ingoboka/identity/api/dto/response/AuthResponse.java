package rw.ingoboka.identity.api.dto.response;

import java.util.UUID;
import lombok.Builder;
import lombok.Data;
import rw.ingoboka.identity.domain.model.LanguageCode;
import rw.ingoboka.identity.domain.model.UserRole;

@Data
@Builder
public class AuthResponse {

    private String accessToken;

    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private long expiresIn;

    private UUID userId;

    private UserRole role;

    private LanguageCode preferredLanguage;

    private String message;
}
