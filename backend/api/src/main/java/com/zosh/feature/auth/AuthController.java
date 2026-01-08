package com.zosh.feature.auth;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.zosh.common.api.ErrorResponse;
import com.zosh.db.entity.UserEntity;
import com.zosh.db.repo.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
public class AuthController {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtEncoder jwtEncoder;

	public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtEncoder = jwtEncoder;
	}

	public record RegisterRequest(
			@NotBlank @Size(max = 100) String name,
			@NotBlank @Email @Size(max = 150) String email,
			@NotBlank @Size(min = 6, max = 200) String password
	) {}

	public record LoginRequest(
			@NotBlank @Email @Size(max = 150) String email,
			@NotBlank @Size(min = 6, max = 200) String password
	) {}

	public record AuthResponse(String token) {}

	@PostMapping("/api/auth/register")
	public Object register(@Valid @RequestBody RegisterRequest req) {
		if (userRepository.findByEmail(req.email()).isPresent()) {
			return new org.springframework.http.ResponseEntity<>(
					ErrorResponse.of("EMAIL_EXISTS", "Email already registered"),
					HttpStatus.CONFLICT
			);
		}

		UserEntity user = new UserEntity();
		user.setName(req.name());
		user.setEmail(req.email().toLowerCase());
		user.setPasswordHash(passwordEncoder.encode(req.password()));
		userRepository.save(user);

		return new AuthResponse(issueToken(user));
	}

	@PostMapping("/api/auth/login")
	public Object login(@Valid @RequestBody LoginRequest req) {
		UserEntity user = userRepository.findByEmail(req.email().toLowerCase())
				.orElse(null);
		if (user == null || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
			return new org.springframework.http.ResponseEntity<>(
					ErrorResponse.of("INVALID_CREDENTIALS", "Invalid email or password"),
					HttpStatus.UNAUTHORIZED
			);
		}
		return new AuthResponse(issueToken(user));
	}

	private String issueToken(UserEntity user) {
		Instant now = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer("civicpulse")
				.issuedAt(now)
				.expiresAt(now.plus(7, ChronoUnit.DAYS))
				.subject(user.getId().toString())
				.claim("email", user.getEmail())
				.claim("role", user.getRole().name())
				.build();
		return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
	}
}
