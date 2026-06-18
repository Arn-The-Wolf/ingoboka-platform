package rw.ingoboka.customer.api.dto.response;

import java.time.LocalDate;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DependantResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String relationship;
    private LocalDate dateOfBirth;
    private String gender;
    private boolean active;
}
