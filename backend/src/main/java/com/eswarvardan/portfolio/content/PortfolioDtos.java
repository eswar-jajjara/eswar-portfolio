package com.eswarvardan.portfolio.content;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

record SummaryRequest(
    @NotBlank @Size(max = 160) String fullName,
    @NotBlank @Size(max = 240) String headline,
    @NotBlank @Size(max = 1600) String intro,
    @NotBlank @Size(max = 4000) String bio,
    @NotBlank @Size(max = 160) String location,
    @NotBlank @Email @Size(max = 254) String email,
    @Size(max = 2000) String linkedinUrl,
    @Size(max = 2000) String githubUrl,
    @Size(max = 2000) String resumeUrl,
    AvailabilityStatus availabilityStatus,
    @Size(max = 2000) String bookingUrl,
    @Size(max = 500) String currentlyBuilding) { }

record ProjectRequest(
    @NotBlank @Size(max = 240) String title,
    @NotBlank @Size(max = 4000) String description,
    @NotBlank @Size(max = 2000) String techStack,
    @Size(max = 2000) String link,
    @Size(max = 2000) String imageUrl,
    @Size(max = 1600) String impactMetrics,
    boolean featured,
    int sortOrder) { }

record ExperienceRequest(
    @NotBlank @Size(max = 240) String role,
    @NotBlank @Size(max = 240) String company,
    @NotBlank @Size(max = 100) String startDate,
    @Size(max = 100) String endDate,
    @NotBlank @Size(max = 4000) String description,
    int sortOrder) { }

record CertificationRequest(
    @NotBlank @Size(max = 320) String name,
    @NotBlank @Size(max = 240) String issuer,
    @NotBlank @Size(max = 100) String issuedDate,
    @Size(max = 2000) String link,
    int sortOrder) { }

record EndorsementRequest(
    @NotBlank @Size(max = 240) String name,
    @NotBlank @Size(max = 240) String role,
    @NotBlank @Size(max = 2000) String quote,
    @Size(max = 2000) String link,
    int sortOrder) { }

record SummaryResponse(Long id, String fullName, String headline, String intro, String bio, String location, String email,
                       String linkedinUrl, String githubUrl, String resumeUrl, AvailabilityStatus availabilityStatus, String bookingUrl,
                       String currentlyBuilding, Instant updatedAt) { }
record ProjectResponse(UUID id, String title, String description, String techStack, String link, String imageUrl, String impactMetrics, boolean featured, int sortOrder) { }
record ExperienceResponse(UUID id, String role, String company, String startDate, String endDate, String description, int sortOrder) { }
record CertificationResponse(UUID id, String name, String issuer, String issuedDate, String link, int sortOrder) { }
record EndorsementResponse(UUID id, String name, String role, String quote, String link, int sortOrder) { }

final class PortfolioMapper {
  private PortfolioMapper() { }
  static SummaryResponse summary(Summary value) { return new SummaryResponse(value.getId(), value.getFullName(), value.getHeadline(), value.getIntro(), value.getBio(), value.getLocation(), value.getEmail(), value.getLinkedinUrl(), value.getGithubUrl(), value.getResumeUrl(), value.getAvailabilityStatus(), value.getBookingUrl(), value.getCurrentlyBuilding(), value.getUpdatedAt()); }
  static ProjectResponse project(Project value) { return new ProjectResponse(value.getId(), value.getTitle(), value.getDescription(), value.getTechStack(), value.getLink(), value.getImageUrl(), value.getImpactMetrics(), value.isFeatured(), value.getSortOrder()); }
  static ExperienceResponse experience(Experience value) { return new ExperienceResponse(value.getId(), value.getRole(), value.getCompany(), value.getStartDate(), value.getEndDate(), value.getDescription(), value.getSortOrder()); }
  static CertificationResponse certification(Certification value) { return new CertificationResponse(value.getId(), value.getName(), value.getIssuer(), value.getIssuedDate(), value.getLink(), value.getSortOrder()); }
  static EndorsementResponse endorsement(Endorsement value) { return new EndorsementResponse(value.getId(), value.getName(), value.getRole(), value.getQuote(), value.getLink(), value.getSortOrder()); }
}
