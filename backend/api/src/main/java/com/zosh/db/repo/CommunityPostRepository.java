package com.zosh.db.repo;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.db.entity.CommunityPostEntity;

public interface CommunityPostRepository extends JpaRepository<CommunityPostEntity, UUID> {
	List<CommunityPostEntity> findTop50ByOrderByCreatedAtDesc();
}
