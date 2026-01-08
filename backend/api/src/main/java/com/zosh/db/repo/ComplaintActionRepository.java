package com.zosh.db.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.db.entity.ComplaintActionEntity;

public interface ComplaintActionRepository extends JpaRepository<ComplaintActionEntity, UUID> {}
