package rw.ingoboka.shared.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import rw.ingoboka.shared.config.AppProperties;

@Service
@ConditionalOnProperty(name = "app.sms.provider", havingValue = "http")
@RequiredArgsConstructor
@Slf4j
public class HttpSmsAdapter implements SmsPort {

    private final AppProperties appProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendOtp(String phone, String otpCode) {
        sendMessage(phone, "Your Ingoboka verification code is: " + otpCode);
    }

    @Override
    public void sendMessage(String phone, String message) {
        AppProperties.Sms sms = appProperties.getSms();
        if (sms.getApiUrl() == null || sms.getApiUrl().isBlank()) {
            log.warn("SMS API URL not configured; message to {} not sent", phone);
            return;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (sms.getApiKey() != null && !sms.getApiKey().isBlank()) {
            headers.set("Authorization", "Bearer " + sms.getApiKey());
        }
        var body = java.util.Map.of("to", phone, "message", message);
        restTemplate.postForEntity(sms.getApiUrl(), new HttpEntity<>(body, headers), String.class);
    }
}
