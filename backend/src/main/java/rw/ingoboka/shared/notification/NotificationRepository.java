package rw.ingoboka.shared.notification;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {
}
