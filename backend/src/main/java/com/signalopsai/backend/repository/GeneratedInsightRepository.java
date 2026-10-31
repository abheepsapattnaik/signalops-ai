package com.signalopsai.backend.repository;

import com.signalopsai.backend.entity.GeneratedInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GeneratedInsightRepository extends JpaRepository<GeneratedInsight, UUID> {
}
