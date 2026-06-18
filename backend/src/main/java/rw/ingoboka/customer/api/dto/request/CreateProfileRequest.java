package rw.ingoboka.customer.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateProfileRequest {

    private String nationalId;
    private String district;
    private String occupation;
    private String gender;
}
