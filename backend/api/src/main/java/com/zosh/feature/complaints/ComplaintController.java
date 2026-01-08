package com.zosh.feature.complaints;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zosh.common.exception.NotFoundException;
import com.zosh.db.entity.AreaEntity;
import com.zosh.db.entity.ComplaintCategoryEntity;
import com.zosh.db.entity.ComplaintEntity;
import com.zosh.db.repo.AreaRepository;
import com.zosh.db.repo.ComplaintCategoryRepository;
import com.zosh.db.repo.ComplaintRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.validation.annotation.Validated;

@RestController
@Validated
public class ComplaintController {

	private final ComplaintRepository complaintRepository;
	private final AreaRepository areaRepository;
	private final ComplaintCategoryRepository complaintCategoryRepository;

	public ComplaintController(
			ComplaintRepository complaintRepository,
			AreaRepository areaRepository,
			ComplaintCategoryRepository complaintCategoryRepository
	) {
		this.complaintRepository = complaintRepository;
		this.areaRepository = areaRepository;
		this.complaintCategoryRepository = complaintCategoryRepository;
	}

	public record CreateComplaintRequest(
			@NotNull UUID areaId,
			@NotNull UUID categoryId,
			@NotBlank @Size(max = 255) String anonymousUserHash,
			@NotBlank @Size(max = 200) String title,
			@NotBlank String description,
			List<@Size(max = 2048) String> images
	) {}

	public record CreateComplaintResponse(UUID id) {}

	@PostMapping("/api/complaints")
	public CreateComplaintResponse createComplaint(@Valid @RequestBody CreateComplaintRequest req) {
		AreaEntity area = areaRepository.findById(req.areaId())
				.orElseThrow(() -> new NotFoundException("Area not found"));
		ComplaintCategoryEntity category = complaintCategoryRepository.findById(req.categoryId())
				.orElseThrow(() -> new NotFoundException("Category not found"));

		ComplaintEntity c = new ComplaintEntity();
		c.setArea(area);
		c.setCategory(category);
		c.setAnonymousUserHash(req.anonymousUserHash());
		c.setTitle(req.title());
		c.setDescription(req.description());
		c.setImages(req.images() == null ? null : req.images().toArray(new String[0]));

		ComplaintEntity saved = complaintRepository.save(c);
		return new CreateComplaintResponse(saved.getId());
	}

	public record ComplaintSummaryDto(UUID id, String title, String status, Instant createdAt) {}

	@GetMapping("/api/complaints/my")
	public List<ComplaintSummaryDto> myComplaints(@RequestParam @NotBlank String anonymousUserHash) {
		return complaintRepository.findByAnonymousUserHashOrderByCreatedAtDesc(anonymousUserHash).stream()
				.map(c -> new ComplaintSummaryDto(c.getId(), c.getTitle(), c.getStatus().name(), c.getCreatedAt()))
				.toList();
	}

	public record ComplaintDetailDto(
			UUID id,
			String title,
			String description,
			String status,
			List<String> images,
			Instant createdAt,
			Instant updatedAt
	) {}

	@GetMapping("/api/complaints/{id}")
	public ComplaintDetailDto complaintDetail(
			@PathVariable UUID id,
			@RequestParam @NotBlank String anonymousUserHash
	) {
		ComplaintEntity c = complaintRepository.findByIdAndAnonymousUserHash(id, anonymousUserHash)
				.orElseThrow(() -> new NotFoundException("Complaint not found"));
		List<String> images = c.getImages() == null ? List.of() : List.of(c.getImages());
		return new ComplaintDetailDto(
				c.getId(),
				c.getTitle(),
				c.getDescription(),
				c.getStatus().name(),
				images,
				c.getCreatedAt(),
				c.getUpdatedAt()
		);
	}
}
