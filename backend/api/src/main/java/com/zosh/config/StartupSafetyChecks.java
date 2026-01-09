package com.zosh.config;

import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class StartupSafetyChecks implements ApplicationRunner {

	private static final String DEV_DEFAULT_JWT_SECRET_BASE64 =
			"Y2l2aWNwdWxzZS1kZXYtc2VjcmV0LWNpdmljcHVsc2UtZGV2LXNlY3JldA==";

	private final String env;
	private final String jwtSecretBase64;

	public StartupSafetyChecks(
			@Value("${civicpulse.env:dev}") String env,
			@Value("${security.jwt.secret:}") String jwtSecretBase64
	) {
		this.env = env == null ? "dev" : env.trim().toLowerCase();
		this.jwtSecretBase64 = jwtSecretBase64 == null ? "" : jwtSecretBase64.trim();
	}

	@Override
	public void run(ApplicationArguments args) {
		boolean isProd = env.equals("prod") || env.equals("production");
		if (isProd) {
			if (jwtSecretBase64.isBlank()) {
				throw new IllegalStateException("Missing JWT secret (security.jwt.secret). Set JWT_SECRET_BASE64.");
			}
			if (jwtSecretBase64.equals(DEV_DEFAULT_JWT_SECRET_BASE64)) {
				throw new IllegalStateException("Refusing to start in prod with the default dev JWT secret.");
			}
		}

		if (!jwtSecretBase64.isBlank()) {
			byte[] secretBytes;
			try {
				secretBytes = Base64.getDecoder().decode(jwtSecretBase64);
			} catch (IllegalArgumentException ex) {
				throw new IllegalStateException("JWT secret must be base64-encoded (JWT_SECRET_BASE64).", ex);
			}

			// HS256 requires >= 256-bit key for good security.
			if (secretBytes.length < 32) {
				throw new IllegalStateException("JWT secret is too short. Use at least 32 bytes (256-bit) before base64 encoding.");
			}
		}
	}
}
