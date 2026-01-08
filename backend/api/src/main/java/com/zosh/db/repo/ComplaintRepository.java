package com.zosh.db.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.db.entity.ComplaintEntity;

public interface ComplaintRepository extends JpaRepository<ComplaintEntity, UUID> {
	List<ComplaintEntity> findByAnonymousUserHashOrderByCreatedAtDesc(String anonymousUserHash);
	Optional<ComplaintEntity> findByIdAndAnonymousUserHash(UUID id, String anonymousUserHash);
}
