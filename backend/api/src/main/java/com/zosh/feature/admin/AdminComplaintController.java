package com.zosh.feature.admin;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
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
import jakarta.validation.constraints.Size;

import org.springframework.transaction.annotation.Transactional;

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

	public record AdminComplaintSummaryDto(
			UUID id,
			String title,
			String status,
			UUID areaId,
			UUID categoryId,
			Instant createdAt
	) {}

	@GetMapping("/api/admin/complaints")
	public List<AdminComplaintSummaryDto> listComplaints(
			@RequestParam(required = false) String status,
			@RequestParam(required = false) UUID areaId
	) {
		List<ComplaintEntity> complaints;

		ComplaintStatus parsedStatus = null;
		if (status != null && !status.isBlank()) {
			try {
				parsedStatus = ComplaintStatus.valueOf(status);
			} catch (Exception e) {
				throw new IllegalArgumentException("Invalid status");
			}
		}

		if (parsedStatus != null && areaId != null) {
			complaints = complaintRepository.findByStatusAndArea_IdOrderByCreatedAtDesc(parsedStatus, areaId);
		} else if (parsedStatus != null) {
			complaints = complaintRepository.findByStatusOrderByCreatedAtDesc(parsedStatus);
		} else if (areaId != null) {
			complaints = complaintRepository.findByArea_IdOrderByCreatedAtDesc(areaId);
		} else {
			complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
		}

		return complaints.stream()
				.map(c -> new AdminComplaintSummaryDto(
						c.getId(),
						c.getTitle(),
						c.getStatus().name(),
						c.getArea().getId(),
						c.getCategory().getId(),
						c.getCreatedAt()
				))
				.toList();
	}

	public record UpdateStatusRequest(@NotBlank String status, @Size(max = 500) String comment) {}
	public record UpdateStatusResponse(boolean ok) {}

	@PostMapping("/api/admin/complaints/{id}/status")
	@Transactional
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

		ComplaintStatus previousStatus = complaint.getStatus();
		complaint.setStatus(newStatus);
		complaintRepository.save(complaint);

		ComplaintActionEntity action = new ComplaintActionEntity();
		action.setComplaint(complaint);
		action.setAdmin(admin);
		action.setAction(ComplaintActionType.STATUS_UPDATE);
		action.setComment(req.comment());
		complaintActionRepository.save(action);

		// Auto-post on transition to RESOLVED. Also de-dupe by embedding complaint id in title.
		if (previousStatus != ComplaintStatus.RESOLVED && newStatus == ComplaintStatus.RESOLVED) {
			String suffix = ": " + complaint.getTitle();
			String prefix = "Resolved [" + complaint.getId() + "]";
			String title = prefix + suffix;
			if (title.length() > 200) {
				title = title.substring(0, 200);
			}

			if (!communityPostRepository.existsByTypeAndTitle(CommunityPostType.RESOLVED_COMPLAINT, title)) {
				CommunityPostEntity post = new CommunityPostEntity();
				post.setType(CommunityPostType.RESOLVED_COMPLAINT);
				post.setTitle(title);
				String comment = req.comment() == null ? "" : req.comment().trim();
				String content = "Complaint resolved.\n\n"
						+ "ComplaintId: " + complaint.getId() + "\n"
						+ (comment.isBlank() ? "" : ("Resolution note: " + comment + "\n"));
				post.setContent(content);
				post.setMediaUrls(null);
				post.setUser(null);
				communityPostRepository.save(post);
			}
		}

		return new UpdateStatusResponse(true);
	}
}
