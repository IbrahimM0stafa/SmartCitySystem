package com.example.DXC.repository;

import com.example.DXC.model.StreetLightSensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository for Street-light sensor readings.
 */
@Repository
public interface StreetLightSensorDataRepository
        extends JpaRepository<StreetLightSensorData, UUID>,
        JpaSpecificationExecutor<StreetLightSensorData> {
}
