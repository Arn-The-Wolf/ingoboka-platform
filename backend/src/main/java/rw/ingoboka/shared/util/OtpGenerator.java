package rw.ingoboka.shared.util;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;
import rw.ingoboka.shared.config.AppProperties;

@Component
public class OtpGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final AppProperties appProperties;

    public OtpGenerator(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public String generate() {
        int length = appProperties.getOtp().getLength();
        return generateOtp(length);
    }

    public String generateOtp(int length) {
        if (length < 4 || length > 10) {
            throw new IllegalArgumentException("OTP length must be between 4 and 10");
        }
        int bound = (int) Math.pow(10, length);
        int otp = RANDOM.nextInt(bound);
        return String.format("%0" + length + "d", otp);
    }
}
