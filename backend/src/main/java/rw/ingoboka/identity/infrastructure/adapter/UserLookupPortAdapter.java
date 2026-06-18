package rw.ingoboka.identity.infrastructure.adapter;

import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import rw.ingoboka.identity.api.mapper.AuthMapper;
import rw.ingoboka.identity.application.port.UserLookupPort;
import rw.ingoboka.identity.domain.model.User;
import rw.ingoboka.identity.infrastructure.persistence.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class UserLookupPortAdapter implements UserLookupPort {

    private final UserRepository userRepository;
    private final AuthMapper authMapper;

    @Override
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id).map(authMapper::toDomain);
    }

    @Override
    public Optional<User> findByPhone(String phone) {
        return userRepository.findByPhone(phone).map(authMapper::toDomain);
    }
}
