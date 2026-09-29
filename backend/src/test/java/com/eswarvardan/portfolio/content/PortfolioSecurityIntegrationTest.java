package com.eswarvardan.portfolio.content;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockMultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(properties = {
    "app.jwt.secret=portfolio-security-test-secret-must-be-at-least-32-characters",
    "app.admin.username=test-admin",
    "app.admin.password-hash=$2a$10$cSwp5hrPIogWh1dl4Vih1.0cuG7RgAXAK1fYLu5bvELeq6SxK4.Lu",
    "app.cors.allowed-origins=http://localhost:5181",
    "app.auth-rate-limit.max-failures=3",
    "app.auth-rate-limit.lockout-seconds=60"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PortfolioSecurityIntegrationTest {
  private static final String LOGIN_PATH = "/api/auth/login";
  private static final String INVALID_CREDENTIALS = "Invalid username or password";

  @Autowired private MockMvc mockMvc;
  @Autowired private SummaryRepository summaries;
  @Autowired private ObjectMapper mapper;

  @Test
  void aggregatePortfolioExposesContentWithoutSecrets() throws Exception {
    mockMvc.perform(get("/api/public/portfolio"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.summary.fullName").value("Eswar Vardan Jajjara"))
        .andExpect(jsonPath("$.projects").isArray())
        .andExpect(jsonPath("$.certifications").isArray())
        .andExpect(jsonPath("$.passwordHash").doesNotExist());
  }

  @Test
  void uploadsRequireAuthenticationAndRemainDownloadable() throws Exception {
    var file = new MockMultipartFile("file", "certificate.pdf", "application/pdf", "%PDF-1.7\nTest document".getBytes());
    mockMvc.perform(multipart("/api/admin/media").file(file)).andExpect(status().isForbidden());
    var loginResult = mockMvc.perform(login("test-admin", "test-password", "198.51.100.21"))
        .andExpect(status().isOk()).andReturn();
    String token = mapper.readTree(loginResult.getResponse().getContentAsString()).path("token").asText();
    var uploaded = mockMvc.perform(multipart("/api/admin/media").file(file).header("Authorization", "Bearer " + token))
        .andExpect(status().isCreated()).andReturn();
    String url = mapper.readTree(uploaded.getResponse().getContentAsString()).path("url").asText();
    mockMvc.perform(get(url)).andExpect(status().isOk())
        .andExpect(header().string("Content-Type", "application/pdf"))
        .andExpect(header().string("X-Content-Type-Options", "nosniff"));
    var executable = new MockMultipartFile("file", "fake.pdf", "application/pdf", "<script>alert(1)</script>".getBytes());
    mockMvc.perform(multipart("/api/admin/media").file(executable).header("Authorization", "Bearer " + token))
        .andExpect(status().isBadRequest());
  }

  @BeforeEach
  void seedPublicSummary() {
    summaries.deleteAll();
    Summary summary = new Summary(1L);
    summary.update(new SummaryRequest(
        "Eswar Vardan Jajjara",
        "AI / ML Engineer",
        "Building practical edge intelligence.",
        "Test portfolio data for the public API.",
        "India",
        "eswar@example.test",
        null,
        "https://github.com/eswar-jajjara",
        null,
        AvailabilityStatus.OPEN_TO_WORK,
        null,
        null));
    summaries.save(summary);
  }

  @Test
  void corsAcceptsTheConfiguredLocalFrontend() throws Exception {
    mockMvc.perform(options("/api/public/summary")
            .header(HttpHeaders.ORIGIN, "http://localhost:5181")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
        .andExpect(status().isOk())
        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5181"));
  }

  @Test
  void publicSummaryIsAvailableWithoutAuthentication() throws Exception {
    mockMvc.perform(get("/api/public/summary"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.fullName").value("Eswar Vardan Jajjara"))
        .andExpect(jsonPath("$.headline").value("AI / ML Engineer"));
  }

  @Test
  void adminApiRejectsUnauthenticatedRequests() throws Exception {
    mockMvc.perform(get("/api/admin/projects"))
        .andExpect(status().isForbidden());
  }

  @Test
  void loginIssuesTokenForCorrectCredentials() throws Exception {
    mockMvc.perform(login("test-admin", "test-password", "198.51.100.10"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").isString())
        .andExpect(jsonPath("$.token").isNotEmpty());
  }

  @Test
  void loginUsesTheSameGenericMessageForInvalidCredentials() throws Exception {
    mockMvc.perform(login("not-an-admin", "wrong-password", "198.51.100.11"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value(INVALID_CREDENTIALS));
  }

  @Test
  void failedLoginAttemptsTemporarilyBlockThatUsernameAndIpPair() throws Exception {
    String remoteAddress = "198.51.100.12";
    for (int attempt = 0; attempt < 3; attempt++) {
      mockMvc.perform(login("test-admin", "wrong-password", remoteAddress))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.message").value(INVALID_CREDENTIALS));
    }

    mockMvc.perform(login("test-admin", "test-password", remoteAddress))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value(INVALID_CREDENTIALS));

    mockMvc.perform(login("test-admin", "test-password", "198.51.100.13"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").isString());
  }

  private static org.springframework.test.web.servlet.request.RequestPostProcessor remoteAddress(String remoteAddress) {
    return request -> {
      request.setRemoteAddr(remoteAddress);
      return request;
    };
  }

  private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder login(
      String username, String password, String remoteAddress) {
    String requestBody = "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}";
    return post(LOGIN_PATH)
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody)
        .with(remoteAddress(remoteAddress));
  }
}
