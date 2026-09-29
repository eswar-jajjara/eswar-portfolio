package com.eswarvardan.portfolio.media;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class PortfolioMediaController {
  private final PortfolioMediaRepository media;
  public PortfolioMediaController(PortfolioMediaRepository media) { this.media = media; }

  @PostMapping(value = "/api/admin/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) throws IOException {
    if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a PDF or image smaller than 5 MB");
    }
    byte[] bytes = file.getBytes();
    String contentType = detectedType(bytes);
    if (contentType == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF, JPEG, PNG and WebP files are supported");
    String original = file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename();
    String name = original.replaceAll("[^a-zA-Z0-9._ -]", "_");
    if (name.length() > 240) name = name.substring(name.length() - 240);
    PortfolioMedia saved = media.save(new PortfolioMedia(name, contentType, bytes));
    return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", "/api/public/media/" + saved.getId(),
        "name", saved.getFileName(), "contentType", contentType, "size", bytes.length));
  }

  @GetMapping("/api/public/media/{id}")
  ResponseEntity<byte[]> download(@PathVariable UUID id) {
    PortfolioMedia file = media.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
    // PDFs download as documents. Raster images can be rendered inline; no SVG/HTML is accepted.
    ContentDisposition disposition = (file.getContentType().equals("application/pdf")
        ? ContentDisposition.attachment() : ContentDisposition.inline())
        .filename(file.getFileName(), StandardCharsets.UTF_8).build();
    return ResponseEntity.ok().contentType(MediaType.parseMediaType(file.getContentType()))
        .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
        .header("X-Content-Type-Options", "nosniff")
        .header("Content-Security-Policy", "default-src 'none'; sandbox")
        .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
        .body(file.getContent());
  }

  private String detectedType(byte[] data) {
    if (data.length < 12) return null;
    if (new String(data, 0, 5, StandardCharsets.US_ASCII).equals("%PDF-")) return "application/pdf";
    if ((data[0] & 255) == 255 && (data[1] & 255) == 216 && (data[2] & 255) == 255) return "image/jpeg";
    if ((data[0] & 255) == 137 && data[1] == 80 && data[2] == 78 && data[3] == 71 && data[4] == 13 && data[5] == 10 && data[6] == 26 && data[7] == 10) return "image/png";
    if (new String(data, 0, 4, StandardCharsets.US_ASCII).equals("RIFF") && new String(data, 8, 4, StandardCharsets.US_ASCII).equals("WEBP")) return "image/webp";
    return null;
  }
}
