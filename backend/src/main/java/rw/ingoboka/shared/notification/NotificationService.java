package rw.ingoboka.shared.notification;

import java.util.UUID;

public interface NotificationService {

    void notifyPolicyActivated(UUID citizenProfileId, String policyNumber);

    void notifyClaimDecision(UUID citizenProfileId, String claimNumber, String status);
}
