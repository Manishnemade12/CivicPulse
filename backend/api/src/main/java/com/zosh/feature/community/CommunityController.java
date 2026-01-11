package com.zosh.feature.community;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.zosh.common.exception.NotFoundException;
import com.zosh.common.exception.ForbiddenException;
import com.zosh.db.entity.CommentEntity;
import com.zosh.db.entity.CommunityPostEntity;
import com.zosh.db.entity.PostLikeEntity;
import com.zosh.db.entity.UserEntity;
import com.zosh.db.enums.CommunityPostType;
import com.zosh.db.repo.CommentRepository;
import com.zosh.db.repo.CommunityPostRepository;
import com.zosh.db.repo.PostLikeRepository;
import com.zosh.db.repo.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
public class CommunityController {

	private final CommunityPostRepository communityPostRepository;
	private final CommentRepository commentRepository;
	private final PostLikeRepository postLikeRepository;
	private final UserRepository userRepository;

	public CommunityController(
			CommunityPostRepository communityPostRepository,
			CommentRepository commentRepository,
			PostLikeRepository postLikeRepository,
			UserRepository userRepository
	) {
		this.communityPostRepository = communityPostRepository;
		this.commentRepository = commentRepository;
		this.postLikeRepository = postLikeRepository;
		this.userRepository = userRepository;
	}

	public record FeedItemDto(UUID id, String type, String title, String content, List<String> mediaUrls, Instant createdAt, String authorName, UUID authorId) {}
	public record MyPostDto(UUID id, String type, String title, String content, List<String> mediaUrls, Instant createdAt) {}

	@GetMapping("/api/community/feed")
	public List<FeedItemDto> feed() {
		return communityPostRepository.findTop50ByOrderByCreatedAtDesc().stream()
				.map(p -> new FeedItemDto(
						p.getId(),
						p.getType().name(),
						p.getTitle(),
						p.getContent(),
						p.getMediaUrls() == null ? Collections.emptyList() : Arrays.asList(p.getMediaUrls()),
						p.getCreatedAt(),

						//can remove
						p.getUser() != null ? p.getUser().getName() : "Anonymous User",
						p.getUser() != null ? p.getUser().getId() : null
				))
				.toList();
	}

	@GetMapping("/api/community/me/posts")
	public List<MyPostDto> myPosts(@AuthenticationPrincipal Jwt jwt) {
		UserEntity user = requireUser(jwt);
		return communityPostRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
				.map(p -> new MyPostDto(
						p.getId(),
						p.getType().name(),
						p.getTitle(),
						p.getContent(),
						p.getMediaUrls() == null ? Collections.emptyList() : Arrays.asList(p.getMediaUrls()),
						p.getCreatedAt()
				))
				.toList();
	}

	public record CreatePostRequest(
			@Size(max = 200) String title,
			@NotBlank @Size(max = 5000) String content,
			List<@Size(max = 2048) String> mediaUrls
	) {}
	public record CreatePostResponse(UUID id) {}

	@PostMapping("/api/community/posts")
	public CreatePostResponse createPost(
			@Valid @RequestBody CreatePostRequest req,
			@AuthenticationPrincipal Jwt jwt
	) {
		UserEntity user = requireUser(jwt);

		CommunityPostEntity post = new CommunityPostEntity();
		post.setType(CommunityPostType.USER_POST);
		post.setTitle(req.title());
		post.setContent(req.content());
		post.setMediaUrls(req.mediaUrls() == null ? null : req.mediaUrls().toArray(new String[0]));
		post.setUser(user);

		CommunityPostEntity saved = communityPostRepository.save(post);
		return new CreatePostResponse(saved.getId());
	}

	public record UpdatePostRequest(
			@Size(max = 200) String title,
			@NotBlank @Size(max = 5000) String content,
			List<@Size(max = 2048) String> mediaUrls
	) {}
	public record UpdatePostResponse(boolean ok) {}

	@PutMapping("/api/community/posts/{id}")
	public UpdatePostResponse updateMyPost(
			@PathVariable UUID id,
			@Valid @RequestBody UpdatePostRequest req,
			@AuthenticationPrincipal Jwt jwt
	) {
		UserEntity user = requireUser(jwt);
		CommunityPostEntity post = communityPostRepository.findByIdAndUserId(id, user.getId())
				.orElseThrow(() -> new NotFoundException("Post not found"));

		post.setTitle(req.title());
		post.setContent(req.content());
		post.setMediaUrls(req.mediaUrls() == null ? null : req.mediaUrls().toArray(new String[0]));
		communityPostRepository.save(post);
		return new UpdatePostResponse(true);
	}

	@DeleteMapping("/api/community/posts/{id}")
	public DeleteResponse deleteMyPost(
			@PathVariable UUID id,
			@AuthenticationPrincipal Jwt jwt
	) {
		UserEntity user = requireUser(jwt);
		long deleted = communityPostRepository.deleteByIdAndUserId(id, user.getId());
		if (deleted == 0) {
			throw new NotFoundException("Post not found");
		}
		return new DeleteResponse(true);
	}

	public record CommentDto(UUID id, UUID userId, String comment, Instant createdAt) {}

	@GetMapping("/api/community/posts/{id}/comments")
	public List<CommentDto> listComments(@PathVariable UUID id) {
		// 404 if post does not exist
		communityPostRepository.findById(id).orElseThrow(() -> new NotFoundException("Post not found"));
		return commentRepository.findByPostIdOrderByCreatedAtAsc(id).stream()
				.map(c -> new CommentDto(c.getId(), c.getUser().getId(), c.getComment(), c.getCreatedAt()))
				.toList();
	}

	public record CreateCommentRequest(@NotBlank @Size(max = 1000) String comment) {}
	public record CreateCommentResponse(UUID id) {}

	@PostMapping("/api/community/posts/{id}/comments")
	public CreateCommentResponse createComment(
			@PathVariable UUID id,
			@Valid @RequestBody CreateCommentRequest req,
			@AuthenticationPrincipal Jwt jwt
	) {
		UserEntity user = requireUser(jwt);
		CommunityPostEntity post = communityPostRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Post not found"));

		CommentEntity c = new CommentEntity();
		c.setPost(post);
		c.setUser(user);
		c.setComment(req.comment());

		CommentEntity saved = commentRepository.save(c);
		return new CreateCommentResponse(saved.getId());
	}

	public record LikeResponse(boolean ok) {}

	@PostMapping("/api/community/posts/{id}/like")
	public LikeResponse like(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
		UserEntity user = requireUser(jwt);
		CommunityPostEntity post = communityPostRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Post not found"));

		if (postLikeRepository.findByPostIdAndUserId(post.getId(), user.getId()).isPresent()) {
			return new LikeResponse(true);
		}

		PostLikeEntity like = new PostLikeEntity();
		like.setPost(post);
		like.setUser(user);
		postLikeRepository.save(like);

		return new LikeResponse(true);
	}

	@DeleteMapping("/api/community/posts/{id}/like")
	public LikeResponse unlike(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
		UserEntity user = requireUser(jwt);
		communityPostRepository.findById(id).orElseThrow(() -> new NotFoundException("Post not found"));
		postLikeRepository.deleteByPostIdAndUserId(id, user.getId());
		return new LikeResponse(true);
	}

	public record DeleteResponse(boolean ok) {}

	@DeleteMapping("/api/community/posts/{postId}/comments/{commentId}")
	public DeleteResponse deleteMyComment(
			@PathVariable UUID postId,
			@PathVariable UUID commentId,
			@AuthenticationPrincipal Jwt jwt
	) {
		UserEntity user = requireUser(jwt);
		// ensure post exists
		communityPostRepository.findById(postId).orElseThrow(() -> new NotFoundException("Post not found"));
		// ensure comment exists + belongs to this post
		CommentEntity c = commentRepository.findById(commentId)
				.orElseThrow(() -> new NotFoundException("Comment not found"));
		if (!c.getPost().getId().equals(postId)) {
			throw new NotFoundException("Comment not found");
		}

		long deleted = commentRepository.deleteByIdAndUserId(commentId, user.getId());
		if (deleted == 0) {
			throw new ForbiddenException("Not allowed");
		}
		return new DeleteResponse(true);
	}

	private UserEntity requireUser(Jwt jwt) {
		if (jwt == null || jwt.getSubject() == null) {
			throw new IllegalArgumentException("Missing auth token");
		}
		UUID userId = UUID.fromString(jwt.getSubject());
		return userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("User not found"));
	}
}
