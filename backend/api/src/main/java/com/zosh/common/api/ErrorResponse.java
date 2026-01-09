package com.zosh.common.api;

import java.util.List;

public record ErrorResponse(ErrorBody error) {
	public record ErrorDetail(String field, String message) {}
	public record ErrorBody(String code, String message, List<ErrorDetail> details) {}

	public static ErrorResponse of(String code, String message) {
		return new ErrorResponse(new ErrorBody(code, message, List.of()));
	}

	public static ErrorResponse of(String code, String message, List<ErrorDetail> details) {
		return new ErrorResponse(new ErrorBody(code, message, details == null ? List.of() : details));
	}

	public static ErrorDetail detail(String field, String message) {
		return new ErrorDetail(field, message);
	}
}
