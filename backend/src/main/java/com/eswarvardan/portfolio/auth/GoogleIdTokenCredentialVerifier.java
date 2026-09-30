package com.eswarvardan.portfolio.auth;

import com.eswarvardan.portfolio.config.GoogleLoginProperties;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class GoogleIdTokenCredentialVerifier implements GoogleCredentialVerifier {
  private final GoogleIdTokenVerifier verifier;

  public GoogleIdTokenCredentialVerifier(GoogleLoginProperties properties) {
    // One verifier instance caches Google's rotating public certificates. It is only built
    // when both server-side settings are present; no client-supplied audience is trusted.
    verifier = properties.enabled()
        ? new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(List.of(properties.clientId().trim()))
            .build()
        : null;
  }

  @Override
  public GoogleIdentity verify(String credential) throws IOException {
    if (verifier == null || credential == null || credential.length() > 4096) return null;
    try {
      GoogleIdToken token = verifier.verify(credential);
      if (token == null) return null;
      GoogleIdToken.Payload payload = token.getPayload();
      return new GoogleIdentity(payload.getSubject(), payload.getEmail(), Boolean.TRUE.equals(payload.getEmailVerified()));
    } catch (GeneralSecurityException | IllegalArgumentException exception) {
      return null;
    }
  }
}
