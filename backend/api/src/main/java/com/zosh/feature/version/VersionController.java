package com.zosh.feature.version;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.BuildProperties;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class VersionController {

	private final String appName;
	private final String appVersion;
	private final BuildProperties buildProperties;

	public VersionController(
			@Value("${spring.application.name:civicpulse-backend}") String appName,
			@Value("${app.version:0.0.1}") String appVersion,
			@Nullable BuildProperties buildProperties
	) {
		this.appName = appName;
		this.appVersion = appVersion;
		this.buildProperties = buildProperties;
	}

	public record VersionResponse(String name, String version) {}

	@GetMapping("/api/version")
	public VersionResponse getVersion() {
		String version = buildProperties != null ? buildProperties.getVersion() : appVersion;
		if (version != null && version.endsWith("-SNAPSHOT")) {
			version = version.substring(0, version.length() - "-SNAPSHOT".length());
		}
		if (version == null || version.isBlank()) {
			version = appVersion;
		}
		return new VersionResponse(appName, version);
	}
}
