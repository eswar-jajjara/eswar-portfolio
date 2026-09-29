package com.eswarvardan.portfolio.github;

import java.time.Instant;
import java.util.UUID;

public record GithubProjectMetadataResponse(UUID projectId, int stars, String primaryLanguage, Instant pushedAt) { }
