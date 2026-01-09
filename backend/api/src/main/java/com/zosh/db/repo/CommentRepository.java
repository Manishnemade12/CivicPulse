package com.zosh.db.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.db.entity.CommentEntity;

public interface CommentRepository extends JpaRepository<CommentEntity, UUID> {
	List<CommentEntity> findByPostIdOrderByCreatedAtAsc(UUID postId);
	Optional<CommentEntity> findByIdAndUserId(UUID id, UUID userId);
	long deleteByIdAndUserId(UUID id, UUID userId);
}
