package com.eswarvardan.portfolio.content;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EndorsementRepository extends JpaRepository<Endorsement, UUID> {
  List<Endorsement> findAllByOrderBySortOrderAscCreatedAtDesc();
}
