package rw.ingoboka.identity.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import rw.ingoboka.identity.domain.event.UserRegisteredEvent;

@Slf4j
@Component
public class UserRegisteredEventListener {

    @EventListener
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info(
                "User registered: userId={}, phone={}, email={}. OTP (dev placeholder): {}",
                event.userId(),
                event.phone(),
                event.email(),
                event.otp());
    }
}
