package rw.ingoboka.identity.domain.event;

import java.util.UUID;

public record UserRegisteredEvent(UUID userId, String phone, String email, String otp) {
}
