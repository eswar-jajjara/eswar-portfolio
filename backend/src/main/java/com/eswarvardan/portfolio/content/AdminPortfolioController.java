package com.eswarvardan.portfolio.content;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
public class AdminPortfolioController {
  private final SummaryRepository summaries;
  private final ProjectRepository projects;
  private final ExperienceRepository experience;
  private final CertificationRepository certifications;
  private final EndorsementRepository endorsements;

  public AdminPortfolioController(SummaryRepository summaries, ProjectRepository projects, ExperienceRepository experience, CertificationRepository certifications, EndorsementRepository endorsements) {
    this.summaries = summaries; this.projects = projects; this.experience = experience; this.certifications = certifications; this.endorsements = endorsements;
  }

  @GetMapping("/summary")
  SummaryResponse summary() { return PortfolioMapper.summary(getSummary()); }
  @PostMapping("/summary") @ResponseStatus(HttpStatus.CREATED)
  SummaryResponse createSummary(@Valid @RequestBody SummaryRequest request) {
    if (summaries.existsById(1L)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Summary already exists");
    Summary summary = new Summary(1L); summary.update(request); return PortfolioMapper.summary(summaries.save(summary));
  }
  @PutMapping("/summary")
  SummaryResponse updateSummary(@Valid @RequestBody SummaryRequest request) { Summary summary = getSummary(); summary.update(request); return PortfolioMapper.summary(summaries.save(summary)); }
  @DeleteMapping("/summary") @ResponseStatus(HttpStatus.NO_CONTENT)
  void deleteSummary() { summaries.delete(getSummary()); }

  @GetMapping("/projects") List<ProjectResponse> projects() { return projects.findAllByOrderBySortOrderAscCreatedAtDesc().stream().map(PortfolioMapper::project).toList(); }
  @PostMapping("/projects") @ResponseStatus(HttpStatus.CREATED)
  ProjectResponse createProject(@Valid @RequestBody ProjectRequest request) { Project project = new Project(); project.update(request); return PortfolioMapper.project(projects.save(project)); }
  @PutMapping("/projects/{id}") ProjectResponse updateProject(@PathVariable UUID id, @Valid @RequestBody ProjectRequest request) { Project project = projects.findById(id).orElseThrow(() -> notFound("Project")); project.update(request); return PortfolioMapper.project(projects.save(project)); }
  @DeleteMapping("/projects/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  void deleteProject(@PathVariable UUID id) { projects.delete(projects.findById(id).orElseThrow(() -> notFound("Project"))); }

  @GetMapping("/experience") List<ExperienceResponse> experience() { return experience.findAllByOrderBySortOrderAscCreatedAtDesc().stream().map(PortfolioMapper::experience).toList(); }
  @PostMapping("/experience") @ResponseStatus(HttpStatus.CREATED)
  ExperienceResponse createExperience(@Valid @RequestBody ExperienceRequest request) { Experience item = new Experience(); item.update(request); return PortfolioMapper.experience(experience.save(item)); }
  @PutMapping("/experience/{id}") ExperienceResponse updateExperience(@PathVariable UUID id, @Valid @RequestBody ExperienceRequest request) { Experience item = experience.findById(id).orElseThrow(() -> notFound("Experience entry")); item.update(request); return PortfolioMapper.experience(experience.save(item)); }
  @DeleteMapping("/experience/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  void deleteExperience(@PathVariable UUID id) { experience.delete(experience.findById(id).orElseThrow(() -> notFound("Experience entry"))); }

  @GetMapping("/certifications") List<CertificationResponse> certifications() { return certifications.findAllByOrderBySortOrderAscCreatedAtDesc().stream().map(PortfolioMapper::certification).toList(); }
  @PostMapping("/certifications") @ResponseStatus(HttpStatus.CREATED)
  CertificationResponse createCertification(@Valid @RequestBody CertificationRequest request) { Certification item = new Certification(); item.update(request); return PortfolioMapper.certification(certifications.save(item)); }
  @PutMapping("/certifications/{id}") CertificationResponse updateCertification(@PathVariable UUID id, @Valid @RequestBody CertificationRequest request) { Certification item = certifications.findById(id).orElseThrow(() -> notFound("Certification")); item.update(request); return PortfolioMapper.certification(certifications.save(item)); }
  @DeleteMapping("/certifications/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  void deleteCertification(@PathVariable UUID id) { certifications.delete(certifications.findById(id).orElseThrow(() -> notFound("Certification"))); }

  @GetMapping("/endorsements") List<EndorsementResponse> endorsements() { return endorsements.findAllByOrderBySortOrderAscCreatedAtDesc().stream().map(PortfolioMapper::endorsement).toList(); }
  @PostMapping("/endorsements") @ResponseStatus(HttpStatus.CREATED)
  EndorsementResponse createEndorsement(@Valid @RequestBody EndorsementRequest request) { Endorsement item = new Endorsement(); item.update(request); return PortfolioMapper.endorsement(endorsements.save(item)); }
  @PutMapping("/endorsements/{id}") EndorsementResponse updateEndorsement(@PathVariable UUID id, @Valid @RequestBody EndorsementRequest request) { Endorsement item = endorsements.findById(id).orElseThrow(() -> notFound("Endorsement")); item.update(request); return PortfolioMapper.endorsement(endorsements.save(item)); }
  @DeleteMapping("/endorsements/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  void deleteEndorsement(@PathVariable UUID id) { endorsements.delete(endorsements.findById(id).orElseThrow(() -> notFound("Endorsement"))); }

  private Summary getSummary() { return summaries.findById(1L).orElseThrow(() -> notFound("Summary")); }
  private ResponseStatusException notFound(String resource) { return new ResponseStatusException(HttpStatus.NOT_FOUND, resource + " was not found"); }
}
