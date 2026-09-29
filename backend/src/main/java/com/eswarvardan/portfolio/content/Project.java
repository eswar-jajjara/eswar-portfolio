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
@Table(name = "projects")
public class Project {
  @Id @GeneratedValue @UuidGenerator private UUID id;
  @Column(nullable = false) private String title;
  @Column(nullable = false, length = 4000) private String description;
  @Column(name = "tech_stack", nullable = false, length = 2000) private String techStack;
  @Column(length = 2000) private String link;
  @Column(name = "image_url", length = 2000) private String imageUrl;
  @Column(name = "impact_metrics", length = 1600) private String impactMetrics;
  @Column(nullable = false) private boolean featured = true;
  @Column(name = "sort_order", nullable = false) private int sortOrder;
  @Column(name = "created_at", nullable = false) private Instant createdAt;
  @Column(name = "updated_at", nullable = false) private Instant updatedAt;

  protected Project() { }
  public void update(ProjectRequest request) {
    title = request.title(); description = request.description(); techStack = request.techStack(); link = request.link(); imageUrl = request.imageUrl();
    // Keep a saved metric when an older admin client submits the original
    // project payload. Sending an empty string explicitly clears the field.
    if (request.impactMetrics() != null) impactMetrics = request.impactMetrics();
    featured = request.featured(); sortOrder = request.sortOrder(); updatedAt = Instant.now(); if (createdAt == null) createdAt = updatedAt;
  }
  public UUID getId() { return id; } public String getTitle() { return title; } public String getDescription() { return description; }
  public String getTechStack() { return techStack; } public String getLink() { return link; } public String getImageUrl() { return imageUrl; }
  public String getImpactMetrics() { return impactMetrics; }
  public boolean isFeatured() { return featured; } public int getSortOrder() { return sortOrder; }
}
