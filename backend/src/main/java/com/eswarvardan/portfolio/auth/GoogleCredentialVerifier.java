package com.eswarvardan.portfolio.auth;

import java.io.IOException;

public interface GoogleCredentialVerifier {
  GoogleIdentity verify(String credential) throws IOException;

  record GoogleIdentity(String subject, String email, boolean emailVerified) { }
}
