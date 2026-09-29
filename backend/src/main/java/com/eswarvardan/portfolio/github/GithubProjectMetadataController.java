package com.eswarvardan.portfolio.github;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/github-projects")
public class GithubProjectMetadataController {
  private final GithubProjectMetadataService metadata;

  public GithubProjectMetadataController(GithubProjectMetadataService metadata) {
    this.metadata = metadata;
  }

  @GetMapping
  List<GithubProjectMetadataResponse> projects() {
    return metadata.getProjectMetadata();
  }
}
