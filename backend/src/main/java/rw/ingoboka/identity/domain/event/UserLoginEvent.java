package rw.ingoboka.identity.domain.event;

import java.util.UUID;

public record UserLoginEvent(UUID userId, String ipAddress) {
}
