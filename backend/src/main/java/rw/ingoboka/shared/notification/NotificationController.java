package rw.ingoboka.shared.notification;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.shared.domain.ApiResponse;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Notifications", description = "In-app notifications")
public class NotificationController {

    private final NotificationQueryService notificationQueryService;

    @GetMapping
    @Operation(summary = "List notifications for current user")
    public ApiResponse<List<NotificationResponse>> list(@AuthenticationPrincipal UserEntity user) {
        return ApiResponse.ok(notificationQueryService.listForUser(user.getId()));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ApiResponse<Void> markRead(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id) {
        notificationQueryService.markRead(user.getId(), id);
        return ApiResponse.ok(null, "Marked as read");
    }
}
