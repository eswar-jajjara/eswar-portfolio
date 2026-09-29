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
@Table(name = "experience")
public class Experience {
  @Id @GeneratedValue @UuidGenerator private UUID id;
  @Column(nullable = false) private String role;
  @Column(nullable = false) private String company;
  @Column(name = "start_date", nullable = false) private String startDate;
  @Column(name = "end_date") private String endDate;
  @Column(nullable = false, length = 4000) private String description;
  @Column(name = "sort_order", nullable = false) private int sortOrder;
  @Column(name = "created_at", nullable = false) private Instant createdAt;
  @Column(name = "updated_at", nullable = false) private Instant updatedAt;

  protected Experience() { }
  public void update(ExperienceRequest request) { role = request.role(); company = request.company(); startDate = request.startDate(); endDate = request.endDate(); description = request.description(); sortOrder = request.sortOrder(); updatedAt = Instant.now(); if (createdAt == null) createdAt = updatedAt; }
  public UUID getId() { return id; } public String getRole() { return role; } public String getCompany() { return company; }
  public String getStartDate() { return startDate; } public String getEndDate() { return endDate; } public String getDescription() { return description; } public int getSortOrder() { return sortOrder; }
}
