package rw.ingoboka.identity.api.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;
import rw.ingoboka.identity.domain.model.LanguageCode;
import rw.ingoboka.identity.domain.model.UserRole;
import rw.ingoboka.identity.domain.model.UserStatus;

@Data
@Builder
public class UserResponse {

    private UUID id;

    private String phone;

    private String email;

    private UserRole role;

    private UserStatus status;

    private LanguageCode preferredLanguage;

    private LocalDateTime createdAt;
}
