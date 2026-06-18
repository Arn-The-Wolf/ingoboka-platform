package rw.ingoboka.identity.api.mapper;

import java.time.ZoneOffset;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import rw.ingoboka.identity.api.dto.response.UserResponse;
import rw.ingoboka.identity.domain.model.User;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;

@Mapper(componentModel = "spring")
public interface AuthMapper {

    @Mapping(target = "createdAt", expression = "java(entity.getCreatedAt() == null ? null : java.time.LocalDateTime.ofInstant(entity.getCreatedAt(), java.time.ZoneOffset.UTC))")
    UserResponse toUserResponse(UserEntity entity);

    @Mapping(target = "role", expression = "java(entity.getRole().name())")
    @Mapping(target = "status", expression = "java(entity.getStatus().name())")
    @Mapping(target = "preferredLanguage", expression = "java(entity.getPreferredLanguage().name())")
    @Mapping(target = "createdAt", expression = "java(entity.getCreatedAt() == null ? null : java.time.LocalDateTime.ofInstant(entity.getCreatedAt(), java.time.ZoneOffset.UTC))")
    User toDomain(UserEntity entity);
}
