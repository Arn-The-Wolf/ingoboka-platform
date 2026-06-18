package rw.ingoboka.identity.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.identity.api.dto.request.LoginRequest;
import rw.ingoboka.identity.api.dto.request.RefreshTokenRequest;
import rw.ingoboka.identity.api.dto.request.RegisterRequest;
import rw.ingoboka.identity.api.dto.request.ResendOtpRequest;
import rw.ingoboka.identity.api.dto.request.VerifyOtpRequest;
import rw.ingoboka.identity.api.dto.response.AuthResponse;
import rw.ingoboka.identity.api.dto.response.UserResponse;
import rw.ingoboka.identity.application.service.AuthService;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.shared.domain.ApiResponse;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login, and token management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new citizen account")
    @ApiResponses
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and activate account")
    @ApiResponses
    public ApiResponse<Void> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ApiResponse.ok(null, "Account verified successfully");
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend verification OTP via SMS")
    @ApiResponses
    public ApiResponse<Void> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ApiResponse.ok(null, "OTP sent");
    }

    @PostMapping("/login")
    @Operation(summary = "Login with phone/email and password")
    @ApiResponses
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    @ApiResponses
    public ApiResponse<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke refresh token")
    @ApiResponses
    public ApiResponse<Void> logout(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(user.getId(), request.getRefreshToken());
        return ApiResponse.ok(null, "Logged out successfully");
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    @ApiResponses
    public ApiResponse<UserResponse> getCurrentUser(@AuthenticationPrincipal UserEntity user) {
        return ApiResponse.ok(authService.getCurrentUser(user));
    }
}
