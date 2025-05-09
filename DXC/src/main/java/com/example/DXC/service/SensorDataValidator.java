package com.example.DXC.service;

import com.example.DXC.model.AirPollutionSensorData;
import com.example.DXC.model.StreetLightSensorData;
import com.example.DXC.model.TrafficSensorData;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SensorDataValidator {

    /**
     * Validates traffic sensor data according to constraints.
     * @param data Traffic sensor data to validate
     * @throws IllegalArgumentException if any constraint is violated
     */
    public void validateTrafficData(TrafficSensorData data) {
        // Check ID
        if (data.getId() == null) {
            throw new IllegalArgumentException("Traffic sensor ID cannot be null");
        }

        // Check location
        if (data.getLocation() == null || data.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Traffic sensor location cannot be empty");
        }

        // Check timestamp
        if (data.getTimestamp() == null) {
            throw new IllegalArgumentException("Traffic sensor timestamp cannot be null");
        }
        if (data.getTimestamp().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Traffic sensor timestamp cannot be in the future");
        }

        // Check trafficDensity
        if (data.getTrafficDensity() < 0 || data.getTrafficDensity() > 500) {
            throw new IllegalArgumentException("Traffic density must be between 0 and 500");
        }

        // Check avgSpeed
        if (data.getAvgSpeed() < 0 || data.getAvgSpeed() > 120) {
            throw new IllegalArgumentException("Average speed must be between 0 and 120");
        }

        // Check congestionLevel
        if (data.getCongestionLevel() == null) {
            throw new IllegalArgumentException("Congestion level cannot be null");
        }
    }

    /**
     * Validates air pollution sensor data according to constraints.
     * @param data Air pollution sensor data to validate
     * @throws IllegalArgumentException if any constraint is violated
     */
    public void validateAirPollutionData(AirPollutionSensorData data) {
        // Check ID
        if (data.getId() == null) {
            throw new IllegalArgumentException("Air pollution sensor ID cannot be null");
        }

        // Check location
        if (data.getLocation() == null || data.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Air pollution sensor location cannot be empty");
        }

        // Check timestamp
        if (data.getTimestamp() == null) {
            throw new IllegalArgumentException("Air pollution sensor timestamp cannot be null");
        }
        if (data.getTimestamp().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Air pollution sensor timestamp cannot be in the future");
        }

        // Check CO
        if (data.getCo() < 0 || data.getCo() > 50) {
            throw new IllegalArgumentException("CO level must be between 0 and 50 ppm");
        }

        // Check ozone
        if (data.getOzone() < 0 || data.getOzone() > 300) {
            throw new IllegalArgumentException("Ozone level must be between 0 and 300 ppb");
        }

        // Check pollutionLevel
        if (data.getPollutionLevel() == null) {
            throw new IllegalArgumentException("Pollution level cannot be null");
        }
    }

    /**
     * Validates street light sensor data according to constraints.
     * @param data Street light sensor data to validate
     * @throws IllegalArgumentException if any constraint is violated
     */
    public void validateStreetLightData(StreetLightSensorData data) {
        // Check ID
        if (data.getId() == null) {
            throw new IllegalArgumentException("Street light sensor ID cannot be null");
        }

        // Check location
        if (data.getLocation() == null || data.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Street light sensor location cannot be empty");
        }

        // Check timestamp
        if (data.getTimestamp() == null) {
            throw new IllegalArgumentException("Street light sensor timestamp cannot be null");
        }
        if (data.getTimestamp().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Street light sensor timestamp cannot be in the future");
        }

        // Check brightnessLevel
        if (data.getBrightnessLevel() < 0 || data.getBrightnessLevel() > 100) {
            throw new IllegalArgumentException("Brightness level must be between 0 and 100");
        }

        // Check powerConsumption
        if (data.getPowerConsumption() < 0 || data.getPowerConsumption() > 5000) {
            throw new IllegalArgumentException("Power consumption must be between 0 and 5000");
        }

        // Check status
        if (data.getStatus() == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
    }
}