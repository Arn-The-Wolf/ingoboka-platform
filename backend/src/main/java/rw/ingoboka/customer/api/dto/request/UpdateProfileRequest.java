package rw.ingoboka.customer.api.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String district;
    private String sector;
    private String occupation;
}
