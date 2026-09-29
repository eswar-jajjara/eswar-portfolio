package com.eswarvardan.portfolio.content;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/public")
public class PublicPortfolioController {
  private final SummaryRepository summaries;
  private final ProjectRepository projects;
  private final ExperienceRepository experience;
  private final CertificationRepository certifications;
  private final EndorsementRepository endorsements;

  public PublicPortfolioController(SummaryRepository summaries, ProjectRepository projects, ExperienceRepository experience, CertificationRepository certifications, EndorsementRepository endorsements) {
    this.summaries = summaries; this.projects = projects; this.experience = experience; this.certifications = certifications; this.endorsements = endorsements;
  }

  @GetMapping("/summary")
  SummaryResponse summary() { return summaries.findById(1L).map(PortfolioMapper::summary).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Summary has not been created")); }
  @GetMapping("/portfolio")
  Map<String, Object> portfolio() {
    return Map.of("summary", summary(), "projects", projects(), "experience", experience(),
        "certifications", certifications(), "endorsements", endorsements());
  }
  @GetMapping("/projects")
  List<ProjectResponse> projects() { return projects.findAllByOrderBySortOrderAscCreatedAtDesc().stream().map(PortfolioMapper::project).toList(); }
  @GetMapping("/experience")
  List<ExperienceResponse> experience() { return experience.findAllByOrderBySortOrderAscCreatedAtDesc().stream().map(PortfolioMapper::experience).toList(); }
  @GetMapping("/certifications")
  List<CertificationResponse> certifications() { return certifications.findAllByOrderBySortOrderAscCreatedAtDesc().stream().map(PortfolioMapper::certification).toList(); }
  @GetMapping("/endorsements")
  List<EndorsementResponse> endorsements() { return endorsements.findAllByOrderBySortOrderAscCreatedAtDesc().stream().map(PortfolioMapper::endorsement).toList(); }
}
