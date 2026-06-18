package rw.ingoboka.shared.notification;

import java.time.Instant;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResponse {
    private UUID id;
    private String title;
    private String body;
    private String channel;
    private Instant createdAt;
    private Instant readAt;
}
