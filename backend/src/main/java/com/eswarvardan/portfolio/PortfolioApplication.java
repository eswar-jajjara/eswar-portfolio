package com.eswarvardan.portfolio;

import com.eswarvardan.portfolio.config.AdminProperties;
import com.eswarvardan.portfolio.config.AuthRateLimitProperties;
import com.eswarvardan.portfolio.config.CorsProperties;
import com.eswarvardan.portfolio.config.GoogleLoginProperties;
import com.eswarvardan.portfolio.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, AdminProperties.class, CorsProperties.class, AuthRateLimitProperties.class, GoogleLoginProperties.class})
public class PortfolioApplication {
  public static void main(String[] args) {
    SpringApplication.run(PortfolioApplication.class, args);
  }
}
