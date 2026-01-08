package com.zosh.db.repo;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.db.entity.PostLikeEntity;

public interface PostLikeRepository extends JpaRepository<PostLikeEntity, UUID> {
	Optional<PostLikeEntity> findByPostIdAndUserId(UUID postId, UUID userId);
	long deleteByPostIdAndUserId(UUID postId, UUID userId);
}
