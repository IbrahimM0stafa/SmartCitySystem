package com.example.DXC.repository;

import com.example.DXC.model.TrafficSensorData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TrafficSensorDataRepository extends JpaRepository<TrafficSensorData, UUID> {
}
