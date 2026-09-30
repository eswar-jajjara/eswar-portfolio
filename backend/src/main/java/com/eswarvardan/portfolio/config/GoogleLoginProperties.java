package com.eswarvardan.portfolio.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.google")
public record GoogleLoginProperties(String clientId, String adminEmail) {
  public boolean enabled() {
    return clientId != null && !clientId.isBlank() && adminEmail != null && !adminEmail.isBlank();
  }
}
