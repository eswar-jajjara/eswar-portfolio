package com.eswarvardan.portfolio.content;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;

/**
 * The CMS-controlled availability state shown to recruiters.
 *
 * <p>The API and database intentionally use lower-case, stable values so a
 * client does not need to know the Java enum constant names.</p>
 */
public enum AvailabilityStatus {
  OPEN_TO_WORK("open_to_work"),
  INTERVIEWING("interviewing"),
  NOT_LOOKING("not_looking");

  private final String value;

  AvailabilityStatus(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }

  @JsonCreator
  public static AvailabilityStatus fromValue(String value) {
    return Arrays.stream(values())
        .filter(status -> status.value.equals(value))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("Unsupported availability status"));
  }
}
