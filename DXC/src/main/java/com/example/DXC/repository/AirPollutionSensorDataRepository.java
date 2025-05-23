package com.example.DXC.repository;

import com.example.DXC.model.AirPollutionSensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository for Air-pollution sensor readings.
 */
@Repository
public interface AirPollutionSensorDataRepository
        extends JpaRepository<AirPollutionSensorData, UUID>,
        JpaSpecificationExecutor<AirPollutionSensorData> {
}
