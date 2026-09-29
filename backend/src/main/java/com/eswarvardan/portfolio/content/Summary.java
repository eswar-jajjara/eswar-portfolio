package com.eswarvardan.portfolio.content;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "summary")
public class Summary {
  @Id private Long id;
  @Column(name = "full_name", nullable = false) private String fullName;
  @Column(nullable = false) private String headline;
  @Column(nullable = false, length = 1600) private String intro;
  @Column(nullable = false, length = 4000) private String bio;
  @Column(nullable = false) private String location;
  @Column(nullable = false) private String email;
  @Column(name = "linkedin_url") private String linkedinUrl;
  @Column(name = "github_url") private String githubUrl;
  @Column(name = "resume_url") private String resumeUrl;
  @Convert(converter = AvailabilityStatusConverter.class)
  @Column(name = "availability_status", nullable = false) private AvailabilityStatus availabilityStatus;
  @Column(name = "booking_url") private String bookingUrl;
  @Column(name = "currently_building") private String currentlyBuilding;
  @Column(name = "updated_at", nullable = false) private Instant updatedAt;

  protected Summary() { }
  public Summary(Long id) { this.id = id; }
  public Long getId() { return id; }
  public String getFullName() { return fullName; }
  public String getHeadline() { return headline; }
  public String getIntro() { return intro; }
  public String getBio() { return bio; }
  public String getLocation() { return location; }
  public String getEmail() { return email; }
  public String getLinkedinUrl() { return linkedinUrl; }
  public String getGithubUrl() { return githubUrl; }
  public String getResumeUrl() { return resumeUrl; }
  public AvailabilityStatus getAvailabilityStatus() { return availabilityStatus; }
  public String getBookingUrl() { return bookingUrl; }
  public String getCurrentlyBuilding() { return currentlyBuilding; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void update(SummaryRequest request) {
    fullName = request.fullName(); headline = request.headline(); intro = request.intro(); bio = request.bio();
    location = request.location(); email = request.email(); linkedinUrl = request.linkedinUrl(); githubUrl = request.githubUrl();
    // New optional fields stay intact when an older admin client sends the
    // original SummaryRequest shape. A current client can clear one by sending
    // an empty string.
    if (request.resumeUrl() != null) resumeUrl = request.resumeUrl();
    if (request.bookingUrl() != null) bookingUrl = request.bookingUrl();
    if (request.currentlyBuilding() != null) currentlyBuilding = request.currentlyBuilding();
    availabilityStatus = request.availabilityStatus() == null
        ? (availabilityStatus == null ? AvailabilityStatus.OPEN_TO_WORK : availabilityStatus)
        : request.availabilityStatus();
    updatedAt = Instant.now();
  }
}
