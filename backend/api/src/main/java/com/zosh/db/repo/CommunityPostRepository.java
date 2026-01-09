package com.zosh.db.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.db.entity.CommunityPostEntity;
import com.zosh.db.enums.CommunityPostType;

public interface CommunityPostRepository extends JpaRepository<CommunityPostEntity, UUID> {
	List<CommunityPostEntity> findTop50ByOrderByCreatedAtDesc();
	List<CommunityPostEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
	Optional<CommunityPostEntity> findByIdAndUserId(UUID id, UUID userId);
	long deleteByIdAndUserId(UUID id, UUID userId);
	boolean existsByTypeAndTitle(CommunityPostType type, String title);
}
