package rw.ingoboka.identity.application.port;

import java.util.Optional;
import java.util.UUID;
import rw.ingoboka.identity.domain.model.User;

public interface UserLookupPort {

    Optional<User> findById(UUID id);

    Optional<User> findByPhone(String phone);
}
