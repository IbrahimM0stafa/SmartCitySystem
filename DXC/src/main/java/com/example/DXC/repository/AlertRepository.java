package com.example.DXC.repository;

import com.example.DXC.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByTriggeredAtAfter(LocalDateTime time);
}
