package rw.ingoboka.customer.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import lombok.Data;

@Data
public class CreateDependantRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    private String relationship;

    private LocalDate dateOfBirth;
    private String gender;
    private String nationalId;
}
