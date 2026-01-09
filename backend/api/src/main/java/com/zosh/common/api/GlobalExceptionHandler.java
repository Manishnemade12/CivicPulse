package com.zosh.common.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.zosh.common.exception.ForbiddenException;
import com.zosh.common.exception.NotFoundException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(NotFoundException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(ErrorResponse.of("NOT_FOUND", ex.getMessage()));
	}

	@ExceptionHandler(ForbiddenException.class)
	public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(ErrorResponse.of("FORBIDDEN", ex.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
		List<ErrorResponse.ErrorDetail> details = ex.getBindingResult().getAllErrors().stream().map(err -> {
			if (err instanceof FieldError fe) {
				return ErrorResponse.detail(fe.getField(), fe.getDefaultMessage());
			}
			return ErrorResponse.detail(null, err.getDefaultMessage());
		}).toList();
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ErrorResponse.of("VALIDATION_ERROR", "Invalid request", details));
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
		List<ErrorResponse.ErrorDetail> details = ex.getConstraintViolations().stream()
				.map(this::toDetail)
				.toList();
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ErrorResponse.of("VALIDATION_ERROR", "Invalid request", details));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ErrorResponse.of("BAD_REQUEST", ex.getMessage()));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ErrorResponse> handleNotReadable(HttpMessageNotReadableException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ErrorResponse.of("BAD_REQUEST", "Malformed JSON request body"));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleOther(Exception ex) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(ErrorResponse.of("INTERNAL_ERROR", "Unexpected error"));
	}

	private ErrorResponse.ErrorDetail toDetail(ConstraintViolation<?> cv) {
		String field = cv.getPropertyPath() == null ? null : cv.getPropertyPath().toString();
		return ErrorResponse.detail(field, cv.getMessage());
	}
}
