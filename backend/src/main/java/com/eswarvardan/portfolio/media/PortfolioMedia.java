package com.eswarvardan.portfolio.media;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "portfolio_media")
public class PortfolioMedia {
  @Id private UUID id;
  @Column(name = "file_name", nullable = false, length = 240) private String fileName;
  @Column(name = "content_type", nullable = false, length = 80) private String contentType;
  @Column(nullable = false, columnDefinition = "bytea") private byte[] content;
  @Column(name = "created_at", nullable = false) private Instant createdAt;

  protected PortfolioMedia() { }
  PortfolioMedia(String fileName, String contentType, byte[] content) {
    this.id = UUID.randomUUID();
    this.fileName = fileName;
    this.contentType = contentType;
    this.content = content;
    this.createdAt = Instant.now();
  }
  public UUID getId() { return id; }
  public String getFileName() { return fileName; }
  public String getContentType() { return contentType; }
  public byte[] getContent() { return content; }
}
