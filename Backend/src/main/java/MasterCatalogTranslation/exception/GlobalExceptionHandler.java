package MasterCatalogTranslation.exception;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import MasterCatalogTranslation.model.dto.error.ApiError;
import MasterCatalogTranslation.model.dto.error.FieldError;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleBodyValidation(MethodArgumentNotValidException ex) {

        List<FieldError> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new FieldError(
                        error.getField(),
                        error.getDefaultMessage()
                ))
                .toList();

        ApiError response = new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "Validare eșuată",
                errors
        );

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleParamValidation(ConstraintViolationException ex) {

        List<FieldError> errors = ex.getConstraintViolations()
                .stream()
                .map(violation -> new FieldError(
                        violation.getPropertyPath().toString(),
                        violation.getMessage()
                ))
                .toList();

        ApiError response = new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "Validare eșuată",
                errors
        );

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {

        ApiError response = new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Eroare necunoscută",
                List.of(new FieldError("general", ex.getMessage()))
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}