package rw.ingoboka.shared.infrastructure.idempotency;

import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final IdempotencyKeyRepository repository;

    @Transactional(readOnly = true)
    public boolean isProcessed(String key) {
        return repository.findByKeyAndExpiresAtAfter(key, Instant.now()).isPresent();
    }

    @Transactional
    public void record(String key, String responseBody, long ttlHours) {
        if (key == null || key.isBlank()) {
            return;
        }
        IdempotencyKeyEntity entity = new IdempotencyKeyEntity();
        entity.setKey(key);
        entity.setResponseBody(responseBody);
        entity.setExpiresAt(Instant.now().plusSeconds(ttlHours * 3600));
        repository.save(entity);
    }
}
