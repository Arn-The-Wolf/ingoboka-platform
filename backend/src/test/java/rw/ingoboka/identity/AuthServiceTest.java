package rw.ingoboka.identity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import rw.ingoboka.identity.api.dto.request.LoginRequest;
import rw.ingoboka.identity.api.dto.request.RefreshTokenRequest;
import rw.ingoboka.identity.api.dto.request.RegisterRequest;
import rw.ingoboka.identity.api.dto.request.VerifyOtpRequest;
import rw.ingoboka.identity.api.dto.response.AuthResponse;
import rw.ingoboka.identity.api.mapper.AuthMapper;
import rw.ingoboka.identity.application.service.AuthService;
import rw.ingoboka.identity.domain.event.UserRegisteredEvent;
import rw.ingoboka.identity.domain.exception.DuplicateUserException;
import rw.ingoboka.identity.domain.exception.InvalidCredentialsException;
import rw.ingoboka.identity.domain.exception.OtpExpiredException;
import rw.ingoboka.identity.domain.model.LanguageCode;
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

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private VerificationChallengeRepository challengeRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private OtpGenerator otpGenerator;
    @Mock private HashUtil hashUtil;
    @Mock private AppProperties appProperties;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private AuthMapper authMapper;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        AppProperties.Otp otp = new AppProperties.Otp();
        otp.setLength(6);
        otp.setExpiryMinutes(5);
        AppProperties.Jwt jwt = new AppProperties.Jwt();
        jwt.setAccessTokenExpiryMs(900_000L);
        jwt.setRefreshTokenExpiryMs(604_800_000L);
        when(appProperties.getOtp()).thenReturn(otp);
        when(appProperties.getJwt()).thenReturn(jwt);
    }

    @Test
    void test_register_success() {
        RegisterRequest request = new RegisterRequest();
        request.setPhone("0780000099");
        request.setPassword("password123");
        request.setFirstName("Test");
        request.setLastName("User");
        request.setPreferredLanguage(LanguageCode.RW);

        when(userRepository.existsByPhone("0780000099")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(otpGenerator.generateOtp(6)).thenReturn("123456");
        when(hashUtil.bcryptHash("123456")).thenReturn("otp-hash");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(inv -> {
            UserEntity u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        AuthResponse response = authService.register(request);

        assertThat(response.getUserId()).isNotNull();
        assertThat(response.getAccessToken()).isNull();
        verify(eventPublisher).publishEvent(any(UserRegisteredEvent.class));
    }

    @Test
    void test_register_duplicate_phone_throws() {
        RegisterRequest request = new RegisterRequest();
        request.setPhone("0780000001");
        request.setPassword("password123");
        request.setFirstName("A");
        request.setLastName("B");

        when(userRepository.existsByPhone("0780000001")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateUserException.class);
    }

    @Test
    void test_login_success() {
        UserEntity user = activeUser();
        LoginRequest request = new LoginRequest();
        request.setPhoneOrEmail("0780000001");
        request.setPassword("Ingoboka@2026");

        when(userRepository.findByPhoneOrEmail("0780000001", "0780000001")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Ingoboka@2026", "hash")).thenReturn(true);
        when(jwtService.generateAccessToken(eq(user), anyMap())).thenReturn("access");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh");
        when(hashUtil.hashSha256("refresh")).thenReturn("refresh-hash");

        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("access");
        assertThat(response.getRefreshToken()).isEqualTo("refresh");
        assertThat(response.getRole()).isEqualTo(UserRole.CITIZEN);
    }

    @Test
    void test_login_wrong_password_throws() {
        UserEntity user = activeUser();
        LoginRequest request = new LoginRequest();
        request.setPhoneOrEmail("0780000001");
        request.setPassword("wrong");

        when(userRepository.findByPhoneOrEmail("0780000001", "0780000001")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void test_verifyOtp_success() {
        UserEntity user = pendingUser();
        VerificationChallengeEntity challenge = new VerificationChallengeEntity();
        challenge.setCodeHash("otp-hash");
        challenge.setAttempts(0);
        challenge.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        challenge.setUsed(false);

        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setPhoneOrEmail("0780000001");
        request.setCode("123456");

        when(userRepository.findByPhoneOrEmail("0780000001", "0780000001")).thenReturn(Optional.of(user));
        when(challengeRepository.findByUserIdAndTypeAndUsedFalseAndExpiresAtAfter(
                any(), any(), any())).thenReturn(Optional.of(challenge));
        when(hashUtil.bcryptMatches("123456", "otp-hash")).thenReturn(true);

        authService.verifyOtp(request);

        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
        verify(userRepository).save(user);
    }

    @Test
    void test_verifyOtp_expired_throws() {
        UserEntity user = pendingUser();
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setPhoneOrEmail("0780000001");
        request.setCode("123456");

        when(userRepository.findByPhoneOrEmail("0780000001", "0780000001")).thenReturn(Optional.of(user));
        when(challengeRepository.findByUserIdAndTypeAndUsedFalseAndExpiresAtAfter(
                any(), any(), any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verifyOtp(request))
                .isInstanceOf(OtpExpiredException.class);
    }

    @Test
    void test_refreshToken_rotates_correctly() {
        UserEntity user = activeUser();
        RefreshTokenEntity stored = new RefreshTokenEntity();
        stored.setUserId(user.getId());
        stored.setRevoked(false);
        stored.setExpiresAt(LocalDateTime.now().plusDays(7));

        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("old-refresh");

        when(hashUtil.hashSha256("old-refresh")).thenReturn("old-hash");
        when(refreshTokenRepository.findByTokenHash("old-hash")).thenReturn(Optional.of(stored));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(eq(user), anyMap())).thenReturn("new-access");
        when(jwtService.generateRefreshToken(user)).thenReturn("new-refresh");
        when(hashUtil.hashSha256("new-refresh")).thenReturn("new-hash");

        AuthResponse response = authService.refreshToken(request);

        assertThat(response.getAccessToken()).isEqualTo("new-access");
        assertThat(stored.isRevoked()).isTrue();
        verify(refreshTokenRepository).save(stored);
    }

    private UserEntity activeUser() {
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setPhone("0780000001");
        user.setPasswordHash("hash");
        user.setRole(UserRole.CITIZEN);
        user.setStatus(UserStatus.ACTIVE);
        user.setPreferredLanguage(LanguageCode.RW);
        return user;
    }

    private UserEntity pendingUser() {
        UserEntity user = activeUser();
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        return user;
    }
}
