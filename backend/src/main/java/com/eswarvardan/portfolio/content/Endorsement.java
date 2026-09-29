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
@Table(name = "endorsements")
public class Endorsement {
  @Id @GeneratedValue @UuidGenerator private UUID id;
  @Column(nullable = false) private String name;
  @Column(name = "role_title", nullable = false) private String role;
  @Column(name = "quote_text", nullable = false, length = 2000) private String quote;
  @Column(length = 2000) private String link;
  @Column(name = "sort_order", nullable = false) private int sortOrder;
  @Column(name = "created_at", nullable = false) private Instant createdAt;
  @Column(name = "updated_at", nullable = false) private Instant updatedAt;

  protected Endorsement() { }

  public void update(EndorsementRequest request) {
    name = request.name();
    role = request.role();
    quote = request.quote();
    link = request.link();
    sortOrder = request.sortOrder();
    updatedAt = Instant.now();
    if (createdAt == null) createdAt = updatedAt;
  }

  public UUID getId() { return id; }
  public String getName() { return name; }
  public String getRole() { return role; }
  public String getQuote() { return quote; }
  public String getLink() { return link; }
  public int getSortOrder() { return sortOrder; }
}
