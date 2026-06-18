package rw.ingoboka.shared.util;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Component;

@Component
public class ClaimNumberGenerator {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final AtomicLong SEQUENCE = new AtomicLong(0);
    private static final SecureRandom RANDOM = new SecureRandom();

    public String generate() {
        String datePart = LocalDate.now().format(DATE_FORMAT);
        long sequence = SEQUENCE.incrementAndGet() % 10_000;
        int randomPart = RANDOM.nextInt(900) + 100;
        return String.format("CLM-%s-%04d-%03d", datePart, sequence, randomPart);
    }
}
