package com.example.DXC.repository;

import com.example.DXC.model.AirPollutionSensorData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AirPollutionSensorDataRepository extends JpaRepository<AirPollutionSensorData, UUID> {
}
