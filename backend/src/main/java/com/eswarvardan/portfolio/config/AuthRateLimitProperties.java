package com.eswarvardan.portfolio.config;

import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.auth-rate-limit")
public record AuthRateLimitProperties(
    @Min(1) int maxFailures,
    @Min(1) long lockoutSeconds) { }
