package rw.ingoboka.identity.domain.event;

import java.util.UUID;

public record PhoneVerifiedEvent(UUID userId, String phone) {
}
