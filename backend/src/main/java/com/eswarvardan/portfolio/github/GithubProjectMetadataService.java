package com.eswarvardan.portfolio.github;

import com.eswarvardan.portfolio.content.Project;
import com.eswarvardan.portfolio.content.ProjectRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class GithubProjectMetadataService {
  private static final Pattern GITHUB_REPOSITORY = Pattern.compile("^https?://(?:www\\.)?github\\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+?)(?:\\.git)?/?$");
  private static final Duration CACHE_TTL = Duration.ofHours(6);
  private static final int MAX_REPOSITORIES_PER_REQUEST = 12;

  private final ProjectRepository projects;
  private final ObjectMapper objectMapper;
  private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(4)).build();
  private final ConcurrentHashMap<String, CachedMetadata> cache = new ConcurrentHashMap<>();

  public GithubProjectMetadataService(ProjectRepository projects, ObjectMapper objectMapper) {
    this.projects = projects;
    this.objectMapper = objectMapper;
  }

  public List<GithubProjectMetadataResponse> getProjectMetadata() {
    List<GithubProjectMetadataResponse> result = new ArrayList<>();
    int attempted = 0;
    for (Project project : projects.findAllByOrderBySortOrderAscCreatedAtDesc()) {
      if (attempted >= MAX_REPOSITORIES_PER_REQUEST) break;
      RepositoryReference repository = RepositoryReference.from(project.getLink());
      if (repository == null) continue;
      attempted++;
      RepositoryMetadata metadata = metadataFor(repository);
      if (metadata != null) result.add(new GithubProjectMetadataResponse(project.getId(), metadata.stars(), metadata.primaryLanguage(), metadata.pushedAt()));
    }
    return result;
  }

  private RepositoryMetadata metadataFor(RepositoryReference repository) {
    String key = repository.owner() + "/" + repository.name();
    CachedMetadata cached = cache.get(key);
    if (cached != null && cached.fetchedAt().plus(CACHE_TTL).isAfter(Instant.now())) return cached.metadata();

    synchronized (cache) {
      cached = cache.get(key);
      if (cached != null && cached.fetchedAt().plus(CACHE_TTL).isAfter(Instant.now())) return cached.metadata();
      RepositoryMetadata metadata = fetch(repository);
      cache.put(key, new CachedMetadata(metadata, Instant.now()));
      return metadata;
    }
  }

  private RepositoryMetadata fetch(RepositoryReference repository) {
    HttpRequest request = HttpRequest.newBuilder(URI.create("https://api.github.com/repos/" + repository.owner() + "/" + repository.name()))
        .timeout(Duration.ofSeconds(6))
        .header("Accept", "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .header("User-Agent", "eswar-portfolio-cms")
        .GET()
        .build();
    try {
      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() != 200) return null;
      JsonNode body = objectMapper.readTree(response.body());
      String language = body.path("language").isTextual() ? body.path("language").asText() : null;
      Instant pushedAt = null;
      if (body.path("pushed_at").isTextual()) {
        try { pushedAt = Instant.parse(body.path("pushed_at").asText()); }
        catch (DateTimeParseException ignored) { }
      }
      return new RepositoryMetadata(body.path("stargazers_count").asInt(), language, pushedAt);
    } catch (IOException exception) {
      return null;
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
      return null;
    }
  }

  private record CachedMetadata(RepositoryMetadata metadata, Instant fetchedAt) { }
  private record RepositoryMetadata(int stars, String primaryLanguage, Instant pushedAt) { }
  private record RepositoryReference(String owner, String name) {
    static RepositoryReference from(String link) {
      if (link == null) return null;
      Matcher matcher = GITHUB_REPOSITORY.matcher(link.trim());
      return matcher.matches() ? new RepositoryReference(matcher.group(1), matcher.group(2)) : null;
    }
  }
}
