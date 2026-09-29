package com.eswarvardan.portfolio.content;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExperienceRepository extends JpaRepository<Experience, UUID> {
  List<Experience> findAllByOrderBySortOrderAscCreatedAtDesc();
}
