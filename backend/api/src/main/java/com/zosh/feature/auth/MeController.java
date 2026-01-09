package com.zosh.feature.auth;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zosh.common.exception.NotFoundException;
import com.zosh.db.entity.UserEntity;
import com.zosh.db.repo.UserRepository;

@RestController
public class MeController {

	private final UserRepository userRepository;

	public MeController(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public record MeResponse(UUID id, String name, String email, String role) {}

	@GetMapping("/api/me")
	public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
		if (jwt == null || jwt.getSubject() == null) {
			throw new IllegalArgumentException("Missing auth token");
		}
		UUID userId = UUID.fromString(jwt.getSubject());
		UserEntity user = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("User not found"));
		return new MeResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
	}
}
