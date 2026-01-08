package com.zosh.db.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;
import com.zosh.db.enums.ComplaintStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;


@Entity
@Table(name = "complaints")
public class ComplaintEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@UuidGenerator
	@Column(nullable = false)
	private UUID id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "area_id", nullable = false)
	private AreaEntity area;

	@ManyToOne(optional = false)
	@JoinColumn(name = "category_id", nullable = false)
	private ComplaintCategoryEntity category;

	@Column(name = "anonymous_user_hash", nullable = false, length = 255)
	private String anonymousUserHash;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(nullable = false, columnDefinition = "text")
	private String description;

	@JdbcTypeCode(SqlTypes.ARRAY)
	@Column(columnDefinition = "text[]")
	private String[] images;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(nullable = false, columnDefinition = "complaint_status")
	private ComplaintStatus status = ComplaintStatus.RAISED;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	public UUID getId() {
		return id;
	}

	public AreaEntity getArea() {
		return area;
	}

	public void setArea(AreaEntity area) {
		this.area = area;
	}

	public ComplaintCategoryEntity getCategory() {
		return category;
	}

	public void setCategory(ComplaintCategoryEntity category) {
		this.category = category;
	}

	public String getAnonymousUserHash() {
		return anonymousUserHash;
	}

	public void setAnonymousUserHash(String anonymousUserHash) {
		this.anonymousUserHash = anonymousUserHash;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String[] getImages() {
		return images;
	}

	public void setImages(String[] images) {
		this.images = images;
	}

	public ComplaintStatus getStatus() {
		return status;
	}

	public void setStatus(ComplaintStatus status) {
		this.status = status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
