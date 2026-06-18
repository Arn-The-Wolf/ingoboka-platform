package rw.ingoboka.identity.listener;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import rw.ingoboka.identity.domain.event.UserRegisteredEvent;
import rw.ingoboka.shared.messaging.SmsPort;

@Component
@RequiredArgsConstructor
public class UserRegisteredEventListener {

    private final SmsPort smsPort;

    @EventListener
    public void onUserRegistered(UserRegisteredEvent event) {
        if (event.phone() != null) {
            smsPort.sendOtp(event.phone(), event.otp());
        }
    }
}
