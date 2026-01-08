package com.zosh.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zosh.common.api.ErrorResponse;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class SecurityErrorHandlers {

	public static AuthenticationEntryPoint authenticationEntryPoint(ObjectMapper objectMapper) {
		return (HttpServletRequest request, HttpServletResponse response, org.springframework.security.core.AuthenticationException authException) -> {
			writeJson(response, objectMapper, 401, ErrorResponse.of("UNAUTHORIZED", "Authentication required"));
		};
	}

	public static AccessDeniedHandler accessDeniedHandler(ObjectMapper objectMapper) {
		return (HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) -> {
			writeJson(response, objectMapper, 403, ErrorResponse.of("FORBIDDEN", "Access denied"));
		};
	}

	private static void writeJson(HttpServletResponse response, ObjectMapper objectMapper, int status, ErrorResponse body)
			throws IOException, ServletException {
		response.setStatus(status);
		response.setCharacterEncoding(StandardCharsets.UTF_8.name());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		objectMapper.writeValue(response.getOutputStream(), body);
	}
}
