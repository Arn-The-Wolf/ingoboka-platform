package rw.ingoboka.shared.notification;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.customer.infrastructure.persistence.entity.CitizenProfileEntity;
import rw.ingoboka.customer.infrastructure.persistence.repository.CitizenProfileRepository;

@Service
@RequiredArgsConstructor
public class InAppNotificationService implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final CitizenProfileRepository profileRepository;

    @Override
    @Transactional
    public void notifyPolicyActivated(UUID citizenProfileId, String policyNumber) {
        CitizenProfileEntity profile = profileRepository.findById(citizenProfileId).orElse(null);
        if (profile == null) {
            return;
        }
        NotificationEntity notification = new NotificationEntity();
        notification.setUserId(profile.getUserId());
        notification.setChannel("IN_APP");
        notification.setTitle("Policy activated");
        notification.setBody("Your policy " + policyNumber + " is now active.");
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void notifyClaimDecision(UUID citizenProfileId, String claimNumber, String status) {
        CitizenProfileEntity profile = profileRepository.findById(citizenProfileId).orElse(null);
        if (profile == null) {
            return;
        }
        NotificationEntity notification = new NotificationEntity();
        notification.setUserId(profile.getUserId());
        notification.setChannel("IN_APP");
        notification.setTitle("Claim update");
        notification.setBody("Claim " + claimNumber + " status: " + status);
        notificationRepository.save(notification);
    }
}
