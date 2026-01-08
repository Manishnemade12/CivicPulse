package com.zosh.db.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import com.zosh.db.enums.ComplaintActionType;

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
@Table(name = "complaint_actions")
public class ComplaintActionEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@UuidGenerator
	@Column(nullable = false)
	private UUID id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "complaint_id", nullable = false)
	private ComplaintEntity complaint;

	@ManyToOne(optional = false)
	@JoinColumn(name = "admin_id", nullable = false)
	private UserEntity admin;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(nullable = false, columnDefinition = "complaint_action_type")
	private ComplaintActionType action;

	@Column(columnDefinition = "text")
	private String comment;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	public UUID getId() {
		return id;
	}

	public ComplaintEntity getComplaint() {
		return complaint;
	}

	public void setComplaint(ComplaintEntity complaint) {
		this.complaint = complaint;
	}

	public UserEntity getAdmin() {
		return admin;
	}

	public void setAdmin(UserEntity admin) {
		this.admin = admin;
	}

	public ComplaintActionType getAction() {
		return action;
	}

	public void setAction(ComplaintActionType action) {
		this.action = action;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
