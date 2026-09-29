package com.eswarvardan.portfolio.auth;

import com.eswarvardan.portfolio.config.AdminProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
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
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  public AuthController(AdminProperties admin, JwtService jwtService, LoginAttemptLimiter loginAttemptLimiter) {
    this.admin = admin;
    this.jwtService = jwtService;
    this.loginAttemptLimiter = loginAttemptLimiter;
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

  private ResponseStatusException invalidCredentials() {
    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
  }

  public record LoginRequest(@NotBlank String username, @NotBlank String password) { }
}
