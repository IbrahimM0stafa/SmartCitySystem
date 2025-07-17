package com.example.dxc.repository;

import com.example.dxc.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByTriggeredAtAfter(LocalDateTime time);
}
