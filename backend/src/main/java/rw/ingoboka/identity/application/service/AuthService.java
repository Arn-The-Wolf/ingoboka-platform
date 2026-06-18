package rw.ingoboka.identity.application.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.ingoboka.identity.api.dto.request.LoginRequest;
import rw.ingoboka.identity.api.dto.request.RefreshTokenRequest;
import rw.ingoboka.identity.api.dto.request.RegisterRequest;
import rw.ingoboka.identity.api.dto.request.VerifyOtpRequest;
import rw.ingoboka.identity.api.dto.response.AuthResponse;
import rw.ingoboka.identity.api.dto.response.UserResponse;
import rw.ingoboka.identity.api.mapper.AuthMapper;
import rw.ingoboka.identity.domain.event.PhoneVerifiedEvent;
import rw.ingoboka.identity.domain.event.UserLoginEvent;
import rw.ingoboka.identity.domain.event.UserRegisteredEvent;
import rw.ingoboka.identity.domain.exception.DuplicateUserException;
import rw.ingoboka.identity.domain.exception.InvalidCredentialsException;
import rw.ingoboka.identity.domain.exception.OtpExpiredException;
import rw.ingoboka.identity.domain.exception.OtpInvalidException;
import rw.ingoboka.identity.domain.exception.UserNotFoundException;
import rw.ingoboka.identity.domain.model.ChallengeType;
import rw.ingoboka.identity.domain.model.UserRole;
import rw.ingoboka.identity.domain.model.UserStatus;
import rw.ingoboka.identity.infrastructure.adapter.JwtService;
import rw.ingoboka.identity.infrastructure.persistence.entity.RefreshTokenEntity;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.identity.infrastructure.persistence.entity.VerificationChallengeEntity;
import rw.ingoboka.identity.infrastructure.persistence.repository.RefreshTokenRepository;
import rw.ingoboka.identity.infrastructure.persistence.repository.UserRepository;
import rw.ingoboka.identity.infrastructure.persistence.repository.VerificationChallengeRepository;
import rw.ingoboka.shared.config.AppProperties;
import rw.ingoboka.shared.util.HashUtil;
import rw.ingoboka.shared.util.OtpGenerator;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationChallengeRepository challengeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpGenerator otpGenerator;
    private final HashUtil hashUtil;
    private final AppProperties appProperties;
    private final ApplicationEventPublisher eventPublisher;
    private final AuthMapper authMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        validateContactInfo(request);
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateUserException("Phone number already registered");
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateUserException("Email already registered");
        }

        UserEntity user = new UserEntity();
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(UserRole.CITIZEN);
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setPreferredLanguage(request.getPreferredLanguage());
        user.setMfaEnabled(false);
        user.setEmailVerified(false);
        user.setPhoneVerified(false);
        user = userRepository.save(user);

        String otp = otpGenerator.generateOtp(appProperties.getOtp().getLength());
        VerificationChallengeEntity challenge = new VerificationChallengeEntity();
        challenge.setUserId(user.getId());
        challenge.setType(ChallengeType.PHONE_VERIFICATION);
        challenge.setCodeHash(hashUtil.bcryptHash(otp));
        challenge.setAttempts(0);
        challenge.setExpiresAt(LocalDateTime.now().plusSeconds(appProperties.getOtp().getExpirationSeconds()));
        challenge.setUsed(false);
        challengeRepository.save(challenge);

        eventPublisher.publishEvent(new UserRegisteredEvent(user.getId(), user.getPhone(), user.getEmail(), otp));

        return AuthResponse.builder()
                .userId(user.getId())
                .message("Registration successful. Please verify your OTP.")
                .build();
    }

    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        UserEntity user = findByPhoneOrEmail(request.getPhoneOrEmail());
        VerificationChallengeEntity challenge = challengeRepository
                .findByUserIdAndTypeAndUsedFalseAndExpiresAtAfter(
                        user.getId(), ChallengeType.PHONE_VERIFICATION, LocalDateTime.now())
                .orElseThrow(() -> new OtpExpiredException("OTP expired or not found"));

        if (challenge.getAttempts() >= appProperties.getOtp().getMaxAttempts()) {
            throw new OtpInvalidException("Maximum OTP attempts exceeded");
        }

        challenge.setAttempts(challenge.getAttempts() + 1);
        challengeRepository.save(challenge);

        if (!hashUtil.bcryptMatches(request.getCode(), challenge.getCodeHash())) {
            throw new OtpInvalidException("Invalid OTP code");
        }

        challenge.setUsed(true);
        challenge.setUsedAt(LocalDateTime.now());
        challengeRepository.save(challenge);

        user.setStatus(UserStatus.ACTIVE);
        user.setPhoneVerified(user.getPhone() != null);
        user.setEmailVerified(user.getEmail() != null);
        userRepository.save(user);

        eventPublisher.publishEvent(new PhoneVerifiedEvent(user.getId(), user.getPhone()));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        UserEntity user = findByPhoneOrEmail(request.getPhoneOrEmail());

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidCredentialsException("Account is not active");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        claims.put("userId", user.getId().toString());
        claims.put("role", user.getRole().name());
        if (user.getOrganizationId() != null) {
            claims.put("organizationId", user.getOrganizationId().toString());
        }

        String accessToken = jwtService.generateAccessToken(user, claims);
        String refreshToken = jwtService.generateRefreshToken(user);
        saveRefreshToken(user.getId(), refreshToken, null, null);

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        eventPublisher.publishEvent(new UserLoginEvent(user.getId(), null));

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String tokenHash = hashUtil.hashSha256(request.getRefreshToken());
        RefreshTokenEntity stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid refresh token"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Refresh token expired or revoked");
        }

        UserEntity user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        stored.setRevoked(true);
        stored.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(stored);

        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        claims.put("userId", user.getId().toString());
        claims.put("role", user.getRole().name());
        if (user.getOrganizationId() != null) {
            claims.put("organizationId", user.getOrganizationId().toString());
        }

        String accessToken = jwtService.generateAccessToken(user, claims);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        saveRefreshToken(user.getId(), newRefreshToken, stored.getDeviceInfo(), stored.getIpAddress());

        return buildAuthResponse(user, accessToken, newRefreshToken);
    }

    @Transactional
    public void logout(UUID userId, String refreshToken) {
        String tokenHash = hashUtil.hashSha256(refreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            if (token.getUserId().equals(userId)) {
                token.setRevoked(true);
                token.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(token);
            }
        });
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserEntity user) {
        return authMapper.toUserResponse(user);
    }

    private void saveRefreshToken(UUID userId, String refreshToken, String deviceInfo, String ipAddress) {
        RefreshTokenEntity entity = new RefreshTokenEntity();
        entity.setUserId(userId);
        entity.setTokenHash(hashUtil.hashSha256(refreshToken));
        entity.setDeviceInfo(deviceInfo);
        entity.setIpAddress(ipAddress);
        entity.setExpiresAt(LocalDateTime.now().plusSeconds(
                appProperties.getJwt().getRefreshTokenExpirationMs() / 1000));
        entity.setRevoked(false);
        refreshTokenRepository.save(entity);
    }

    private AuthResponse buildAuthResponse(UserEntity user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(appProperties.getJwt().getAccessTokenExpirationMs() / 1000)
                .userId(user.getId())
                .role(user.getRole())
                .preferredLanguage(user.getPreferredLanguage())
                .build();
    }

    private UserEntity findByPhoneOrEmail(String phoneOrEmail) {
        return userRepository.findByPhoneOrEmail(phoneOrEmail, phoneOrEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private void validateContactInfo(RegisterRequest request) {
        if ((request.getPhone() == null || request.getPhone().isBlank())
                && (request.getEmail() == null || request.getEmail().isBlank())) {
            throw new IllegalArgumentException("Phone or email is required");
        }
    }
}
