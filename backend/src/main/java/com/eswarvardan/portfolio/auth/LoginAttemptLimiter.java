package com.eswarvardan.portfolio.auth;

import com.eswarvardan.portfolio.config.AuthRateLimitProperties;
import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * A small, process-local guard for the one administrator login. It intentionally returns no
 * information about whether an account exists: callers receive the same authentication failure
 * before and during a lockout. A shared, persistent rate limiter should replace this if the API
 * is ever scaled to multiple instances.
 */
@Service
public class LoginAttemptLimiter {
  private static final long CLEANUP_INTERVAL_SECONDS = 60;

  private final AuthRateLimitProperties properties;
  private final Clock clock;
  private final ConcurrentMap<String, AttemptState> attempts = new ConcurrentHashMap<>();
  private final AtomicLong nextCleanupEpochSecond = new AtomicLong();

  @Autowired
  public LoginAttemptLimiter(AuthRateLimitProperties properties) {
    this(properties, Clock.systemUTC());
  }

  LoginAttemptLimiter(AuthRateLimitProperties properties, Clock clock) {
    this.properties = properties;
    this.clock = clock;
  }

  public boolean isLocked(String username, String remoteAddress) {
    Instant now = clock.instant();
    cleanupExpired(now);
    AttemptState state = attempts.get(key(username, remoteAddress));
    return state != null && state.lockedUntil() != null && now.isBefore(state.lockedUntil());
  }

  public void recordFailure(String username, String remoteAddress) {
    Instant now = clock.instant();
    cleanupExpired(now);
    attempts.compute(key(username, remoteAddress), (ignored, previous) -> nextState(previous, now));
  }

  public void recordSuccess(String username, String remoteAddress) {
    attempts.remove(key(username, remoteAddress));
  }

  private AttemptState nextState(AttemptState previous, Instant now) {
    if (previous == null || !now.isBefore(previous.expiresAt())) {
      return stateForFailures(1, now);
    }
    if (previous.lockedUntil() != null && now.isBefore(previous.lockedUntil())) {
      return previous;
    }
    return stateForFailures(previous.failures() + 1, now);
  }

  private AttemptState stateForFailures(int failures, Instant now) {
    Instant expiresAt = now.plusSeconds(properties.lockoutSeconds());
    Instant lockedUntil = failures >= properties.maxFailures() ? expiresAt : null;
    return new AttemptState(failures, expiresAt, lockedUntil);
  }

  private void cleanupExpired(Instant now) {
    long nowEpochSecond = now.getEpochSecond();
    long nextCleanup = nextCleanupEpochSecond.get();
    if (nowEpochSecond < nextCleanup || !nextCleanupEpochSecond.compareAndSet(nextCleanup, nowEpochSecond + CLEANUP_INTERVAL_SECONDS)) {
      return;
    }
    attempts.entrySet().removeIf(entry -> !now.isBefore(entry.getValue().expiresAt()));
  }

  private String key(String username, String remoteAddress) {
    String normalizedUsername = username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
    String clientAddress = remoteAddress == null || remoteAddress.isBlank() ? "unknown" : remoteAddress;
    return normalizedUsername + "|" + clientAddress;
  }

  private record AttemptState(int failures, Instant expiresAt, Instant lockedUntil) { }
}
