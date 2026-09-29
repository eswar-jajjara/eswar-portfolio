package com.eswarvardan.portfolio.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "certifications")
public class Certification {
  @Id @GeneratedValue @UuidGenerator private UUID id;
  @Column(nullable = false) private String name;
  @Column(nullable = false) private String issuer;
  @Column(name = "issued_date", nullable = false) private String issuedDate;
  @Column(length = 2000) private String link;
  @Column(name = "sort_order", nullable = false) private int sortOrder;
  @Column(name = "created_at", nullable = false) private Instant createdAt;
  @Column(name = "updated_at", nullable = false) private Instant updatedAt;

  protected Certification() { }
  public void update(CertificationRequest request) { name = request.name(); issuer = request.issuer(); issuedDate = request.issuedDate(); link = request.link(); sortOrder = request.sortOrder(); updatedAt = Instant.now(); if (createdAt == null) createdAt = updatedAt; }
  public UUID getId() { return id; } public String getName() { return name; } public String getIssuer() { return issuer; }
  public String getIssuedDate() { return issuedDate; } public String getLink() { return link; } public int getSortOrder() { return sortOrder; }
}
