package com.example.dxc.repository;

import com.example.dxc.model.TrafficSensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository for Traffic sensor readings.
 * Extends JpaSpecificationExecutor to enable dynamic filtering.
 */
@Repository
public interface TrafficSensorDataRepository
        extends JpaRepository<TrafficSensorData, UUID>,
        JpaSpecificationExecutor<TrafficSensorData> {
}
