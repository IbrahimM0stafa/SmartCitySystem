package com.example.dxc.service;

import com.example.dxc.model.AirPollutionSensorData;
import com.example.dxc.model.StreetLightSensorData;
import com.example.dxc.model.TrafficSensorData;
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

        if (data.getId() == null) {
            throw new IllegalArgumentException("Traffic sensor ID cannot be null");
        }


        if (data.getLocation() == null || data.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Traffic sensor location cannot be empty");
        }


        if (data.getTimestamp() == null) {
            throw new IllegalArgumentException("Traffic sensor timestamp cannot be null");
        }
        if (data.getTimestamp().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Traffic sensor timestamp cannot be in the future");
        }


        if (data.getTrafficDensity() < 0 || data.getTrafficDensity() > 500) {
            throw new IllegalArgumentException("Traffic density must be between 0 and 500");
        }


        if (data.getAvgSpeed() < 0 || data.getAvgSpeed() > 120) {
            throw new IllegalArgumentException("Average speed must be between 0 and 120");
        }


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

        if (data.getId() == null) {
            throw new IllegalArgumentException("Air pollution sensor ID cannot be null");
        }


        if (data.getLocation() == null || data.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Air pollution sensor location cannot be empty");
        }


        if (data.getTimestamp() == null) {
            throw new IllegalArgumentException("Air pollution sensor timestamp cannot be null");
        }
        if (data.getTimestamp().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Air pollution sensor timestamp cannot be in the future");
        }


        if (data.getCo() < 0 || data.getCo() > 50) {
            throw new IllegalArgumentException("CO level must be between 0 and 50 ppm");
        }


        if (data.getOzone() < 0 || data.getOzone() > 300) {
            throw new IllegalArgumentException("Ozone level must be between 0 and 300 ppb");
        }


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

        if (data.getId() == null) {
            throw new IllegalArgumentException("Street light sensor ID cannot be null");
        }


        if (data.getLocation() == null || data.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Street light sensor location cannot be empty");
        }


        if (data.getTimestamp() == null) {
            throw new IllegalArgumentException("Street light sensor timestamp cannot be null");
        }
        if (data.getTimestamp().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Street light sensor timestamp cannot be in the future");
        }


        if (data.getBrightnessLevel() < 0 || data.getBrightnessLevel() > 100) {
            throw new IllegalArgumentException("Brightness level must be between 0 and 100");
        }


        if (data.getPowerConsumption() < 0 || data.getPowerConsumption() > 5000) {
            throw new IllegalArgumentException("Power consumption must be between 0 and 5000");
        }


        if (data.getStatus() == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
    }
}