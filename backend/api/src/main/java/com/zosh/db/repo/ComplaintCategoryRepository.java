package com.zosh.db.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.db.entity.ComplaintCategoryEntity;

public interface ComplaintCategoryRepository extends JpaRepository<ComplaintCategoryEntity, UUID> {}
