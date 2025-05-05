package com.example.DXC.repository;

import com.example.DXC.model.StreetLightSensorData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StreetLightSensorDataRepository extends JpaRepository<StreetLightSensorData, UUID> {
}
