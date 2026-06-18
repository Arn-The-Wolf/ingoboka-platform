package rw.ingoboka.customer.api.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import rw.ingoboka.customer.infrastructure.persistence.entity.DataRequestEntity.RequestType;

@Data
public class DataRequestRequest {

    @NotNull
    private RequestType requestType;

    private String details;
}
