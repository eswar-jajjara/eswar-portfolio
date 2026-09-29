package com.eswarvardan.portfolio.auth;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.eswarvardan.portfolio.config.AdminProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtService jwtService;
  private final AdminProperties admin;

  public JwtAuthenticationFilter(JwtService jwtService, AdminProperties admin) { this.jwtService = jwtService; this.admin = admin; }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ") && SecurityContextHolder.getContext().getAuthentication() == null) {
      try {
        String username = jwtService.verifyAndGetUsername(header.substring(7));
        if (admin.username().equals(username)) {
          var authentication = new UsernamePasswordAuthenticationToken(username, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authentication);
        }
      } catch (JWTVerificationException ignored) {
        // Invalid or expired tokens remain unauthenticated and are rejected by Spring Security when required.
      }
    }
    filterChain.doFilter(request, response);
  }
}
