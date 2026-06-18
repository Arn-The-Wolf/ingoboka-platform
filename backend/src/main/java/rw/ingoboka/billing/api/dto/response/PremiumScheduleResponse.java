package rw.ingoboka.billing.api.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PremiumScheduleResponse {
    private UUID id;
    private Integer installmentNumber;
    private LocalDate dueDate;
    private BigDecimal amount;
    private String currency;
    private String status;
    private LocalDateTime paidAt;
}
