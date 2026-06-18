package rw.ingoboka.shared.notification;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationQueryService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> listForUser(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .body(n.getBody())
                        .channel(n.getChannel())
                        .createdAt(n.getCreatedAt())
                        .readAt(n.getReadAt())
                        .build())
                .toList();
    }

    @Transactional
    public void markRead(UUID userId, UUID notificationId) {
        notificationRepository.findByIdAndUserId(notificationId, userId).ifPresent(n -> {
            n.setReadAt(java.time.Instant.now());
            notificationRepository.save(n);
        });
    }
}
