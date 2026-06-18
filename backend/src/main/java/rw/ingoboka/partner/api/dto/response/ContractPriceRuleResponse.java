package rw.ingoboka.partner.api.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContractPriceRuleResponse {
    private UUID id;
    private UUID contractId;
    private String ruleType;
    private BigDecimal rateValue;
    private String currency;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
