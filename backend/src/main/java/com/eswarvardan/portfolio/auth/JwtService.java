package com.eswarvardan.portfolio.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.eswarvardan.portfolio.config.JwtProperties;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final Algorithm algorithm;
  private final JWTVerifier verifier;
  private final JwtProperties properties;

  public JwtService(JwtProperties properties) {
    this.properties = properties;
    this.algorithm = Algorithm.HMAC256(properties.secret());
    this.verifier = JWT.require(algorithm).withIssuer("eswar-portfolio-api").build();
  }

  public String issue(String username) {
    Instant now = Instant.now();
    return JWT.create()
        .withIssuer("eswar-portfolio-api")
        .withSubject(username)
        .withIssuedAt(Date.from(now))
        .withExpiresAt(Date.from(now.plus(properties.expirationHours(), ChronoUnit.HOURS)))
        .sign(algorithm);
  }

  public String verifyAndGetUsername(String token) throws JWTVerificationException {
    DecodedJWT jwt = verifier.verify(token);
    return jwt.getSubject();
  }
}
