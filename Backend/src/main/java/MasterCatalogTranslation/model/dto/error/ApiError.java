package MasterCatalogTranslation.model.dto.error;

import java.util.List;

public record ApiError(
     int status,
     String message,
     List<FieldError> errors
){};
