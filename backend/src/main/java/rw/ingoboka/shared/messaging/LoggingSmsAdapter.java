package rw.ingoboka.shared.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.sms.provider", havingValue = "log", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class LoggingSmsAdapter implements SmsPort {

    @Override
    public void sendOtp(String phone, String otpCode) {
        log.info("SMS OTP to {}: {}", phone, otpCode);
    }

    @Override
    public void sendMessage(String phone, String message) {
        log.info("SMS to {}: {}", phone, message);
    }
}
