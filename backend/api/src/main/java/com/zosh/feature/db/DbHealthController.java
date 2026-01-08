package com.zosh.feature.db;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DbHealthController {

	private final JdbcTemplate jdbcTemplate;

	public DbHealthController(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public record DbHealthResponse(String status) {}

	@GetMapping("/api/db/health")
	public DbHealthResponse dbHealth() {
		Integer one = jdbcTemplate.queryForObject("select 1", Integer.class);
		return new DbHealthResponse(one != null && one == 1 ? "UP" : "DOWN");
	}
}
