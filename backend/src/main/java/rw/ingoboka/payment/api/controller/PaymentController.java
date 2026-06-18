package rw.ingoboka.payment.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.payment.api.dto.request.InitiatePaymentRequest;
import rw.ingoboka.payment.api.dto.request.SandboxCallbackRequest;
import rw.ingoboka.payment.api.dto.response.PaymentResponse;
import rw.ingoboka.payment.api.dto.response.PaymentStatusResponse;
import rw.ingoboka.payment.application.service.PaymentService;
import rw.ingoboka.shared.domain.ApiResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Premium payment processing")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Initiate sandbox payment")
    public ApiResponse<PaymentResponse> initiate(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody InitiatePaymentRequest request) {
        return ApiResponse.ok(paymentService.initiateSandboxPayment(request.getPolicyId(), user.getId(), request));
    }

    @PostMapping("/sandbox/callback")
    @Operation(summary = "Sandbox payment callback")
    public ApiResponse<Void> sandboxCallback(@Valid @RequestBody SandboxCallbackRequest request) {
        paymentService.processSandboxCallback(request);
        return ApiResponse.ok(null, "Callback processed");
    }

    @GetMapping("/{id}/status")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Get payment status")
    public ApiResponse<PaymentStatusResponse> getStatus(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id) {
        return ApiResponse.ok(paymentService.getPaymentStatus(id, user.getId()));
    }
}
