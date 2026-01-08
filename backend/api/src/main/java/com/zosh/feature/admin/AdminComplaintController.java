package com.zosh.feature.admin;

import java.util.List;
import java.util.UUID;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.zosh.common.exception.NotFoundException;
import com.zosh.db.entity.ComplaintActionEntity;
import com.zosh.db.entity.ComplaintEntity;
import com.zosh.db.entity.CommunityPostEntity;
import com.zosh.db.entity.UserEntity;
import com.zosh.db.enums.ComplaintActionType;
import com.zosh.db.enums.ComplaintStatus;
import com.zosh.db.enums.CommunityPostType;
import com.zosh.db.repo.ComplaintActionRepository;
import com.zosh.db.repo.ComplaintRepository;
import com.zosh.db.repo.CommunityPostRepository;
import com.zosh.db.repo.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
public class AdminComplaintController {

	private final ComplaintRepository complaintRepository;
	private final ComplaintActionRepository complaintActionRepository;
	private final CommunityPostRepository communityPostRepository;
	private final UserRepository userRepository;

	public AdminComplaintController(
			ComplaintRepository complaintRepository,
			ComplaintActionRepository complaintActionRepository,
			CommunityPostRepository communityPostRepository,
			UserRepository userRepository
	) {
		this.complaintRepository = complaintRepository;
		this.complaintActionRepository = complaintActionRepository;
		this.communityPostRepository = communityPostRepository;
		this.userRepository = userRepository;
	}

	public record AdminComplaintSummaryDto(UUID id, String title, String status, UUID areaId, UUID categoryId) {}

	@GetMapping("/api/admin/complaints")
	public List<AdminComplaintSummaryDto> listComplaints() {
		return complaintRepository.findAll().stream()
				.map(c -> new AdminComplaintSummaryDto(
						c.getId(),
						c.getTitle(),
						c.getStatus().name(),
						c.getArea().getId(),
						c.getCategory().getId()
				))
				.toList();
	}

	public record UpdateStatusRequest(@NotBlank String status, String comment) {}
	public record UpdateStatusResponse(boolean ok) {}

	@PostMapping("/api/admin/complaints/{id}/status")
	public UpdateStatusResponse updateStatus(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateStatusRequest req,
			@AuthenticationPrincipal Jwt jwt
	) {
		ComplaintEntity complaint = complaintRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Complaint not found"));

		UUID adminId = UUID.fromString(jwt.getSubject());
		UserEntity admin = userRepository.findById(adminId)
				.orElseThrow(() -> new NotFoundException("Admin user not found"));

		ComplaintStatus newStatus;
		try {
			newStatus = ComplaintStatus.valueOf(req.status());
		} catch (Exception e) {
			throw new IllegalArgumentException("Invalid status");
		}

		complaint.setStatus(newStatus);
		complaintRepository.save(complaint);

		ComplaintActionEntity action = new ComplaintActionEntity();
		action.setComplaint(complaint);
		action.setAdmin(admin);
		action.setAction(ComplaintActionType.STATUS_UPDATE);
		action.setComment(req.comment());
		complaintActionRepository.save(action);

		if (newStatus == ComplaintStatus.RESOLVED) {
			CommunityPostEntity post = new CommunityPostEntity();
			post.setType(CommunityPostType.RESOLVED_COMPLAINT);
			post.setTitle("Resolved: " + complaint.getTitle());
			post.setContent("A complaint was resolved by the admin team.");
			post.setMediaUrls(null);
			post.setUser(null);
			communityPostRepository.save(post);
		}

		return new UpdateStatusResponse(true);
	}
}
