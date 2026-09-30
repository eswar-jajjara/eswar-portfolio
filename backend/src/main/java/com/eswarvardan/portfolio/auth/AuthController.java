package com.eswarvardan.portfolio.auth;

import com.eswarvardan.portfolio.config.AdminProperties;
import com.eswarvardan.portfolio.config.GoogleLoginProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AdminProperties admin;
  private final JwtService jwtService;
  private final LoginAttemptLimiter loginAttemptLimiter;
  private final GoogleLoginProperties google;
  private final GoogleCredentialVerifier googleCredentialVerifier;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  public AuthController(AdminProperties admin, JwtService jwtService, LoginAttemptLimiter loginAttemptLimiter,
      GoogleLoginProperties google, GoogleCredentialVerifier googleCredentialVerifier) {
    this.admin = admin;
    this.jwtService = jwtService;
    this.loginAttemptLimiter = loginAttemptLimiter;
    this.google = google;
    this.googleCredentialVerifier = googleCredentialVerifier;
  }

  @PostMapping("/login")
  public Map<String, String> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
    String remoteAddress = servletRequest.getRemoteAddr();
    if (loginAttemptLimiter.isLocked(request.username(), remoteAddress)) {
      throw invalidCredentials();
    }

    // Always evaluate the password hash so a rejected username does not get a faster response.
    boolean passwordMatches = passwordEncoder.matches(request.password(), admin.passwordHash());
    boolean usernameMatches = MessageDigest.isEqual(
        admin.username().getBytes(StandardCharsets.UTF_8), request.username().getBytes(StandardCharsets.UTF_8));
    if (!usernameMatches || !passwordMatches) {
      loginAttemptLimiter.recordFailure(request.username(), remoteAddress);
      throw invalidCredentials();
    }

    loginAttemptLimiter.recordSuccess(request.username(), remoteAddress);
    return Map.of("token", jwtService.issue(admin.username()));
  }

  @PostMapping("/google")
  public Map<String, String> googleLogin(@Valid @RequestBody GoogleLoginRequest request, HttpServletRequest servletRequest) {
    if (!google.enabled()) {
      throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google sign-in is not configured");
    }
    String remoteAddress = servletRequest.getRemoteAddr();
    String limitKey = "google-admin";
    if (loginAttemptLimiter.isLocked(limitKey, remoteAddress)) throw invalidGoogleCredentials();

    GoogleCredentialVerifier.GoogleIdentity identity;
    try {
      // Google's library verifies the signature, audience, issuer and expiry before
      // any email claim is considered. The frontend's client ID is never authoritative.
      identity = googleCredentialVerifier.verify(request.credential());
    } catch (IOException exception) {
      throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google sign-in is temporarily unavailable");
    }
    boolean allowed = identity != null && identity.subject() != null && !identity.subject().isBlank()
        && identity.emailVerified() && identity.email() != null
        && identity.email().toLowerCase(Locale.ROOT).endsWith("@gmail.com")
        && identity.email().equalsIgnoreCase(google.adminEmail().trim());
    if (!allowed) {
      loginAttemptLimiter.recordFailure(limitKey, remoteAddress);
      throw invalidGoogleCredentials();
    }

    loginAttemptLimiter.recordSuccess(limitKey, remoteAddress);
    return Map.of("token", jwtService.issue(admin.username()));
  }

  private ResponseStatusException invalidCredentials() {
    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
  }

  private ResponseStatusException invalidGoogleCredentials() {
    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google sign-in was not accepted");
  }

  public record LoginRequest(@NotBlank String username, @NotBlank String password) { }
  public record GoogleLoginRequest(@NotBlank @Size(max = 4096) String credential) { }
}
