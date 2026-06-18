package rw.ingoboka.customer.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecordConsentRequest {

    @NotBlank
    private String consentType;

    @NotBlank
    private String versionRef;

    private boolean granted = true;

    private String channel;
}
