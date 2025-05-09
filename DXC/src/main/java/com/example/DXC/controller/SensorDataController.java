package com.example.DXC.controller;

import com.example.DXC.model.AirPollutionSensorData;
import com.example.DXC.model.StreetLightSensorData;
import com.example.DXC.model.TrafficSensorData;
import com.example.DXC.service.SensorDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/sensors")
@RequiredArgsConstructor
public class SensorDataController {

    private final SensorDataService sensorDataService;

    // Random data generation endpoints
    @PostMapping("/generate/traffic")
    public String generateTrafficData() {
        sensorDataService.generateTrafficData();
        return "✅ Traffic data generated successfully.";
    }

    @PostMapping("/generate/air-pollution")
    public String generateAirPollutionData() {
        sensorDataService.generateAirPollutionData();
        return "✅ Air pollution data generated successfully.";
    }

    @PostMapping("/generate/street-light")
    public String generateStreetLightData() {
        sensorDataService.generateStreetLightData();
        return "✅ Street light data generated successfully.";
    }

    @PostMapping("/generate/all")
    public String generateAllData() {
        sensorDataService.generateTrafficData();
        sensorDataService.generateAirPollutionData();
        sensorDataService.generateStreetLightData();
        return "✅ All sensor data types generated successfully.";
    }

    // Manual data insertion endpoints
    @PostMapping("/traffic")
    public ResponseEntity<TrafficSensorData> addTrafficData(@RequestBody TrafficSensorData data) {
        if (data.getId() == null) {
            data.setId(UUID.randomUUID());
        }
        return ResponseEntity.ok(sensorDataService.saveTrafficData(data));
    }

    @PostMapping("/air-pollution")
    public ResponseEntity<AirPollutionSensorData> addAirPollutionData(@RequestBody AirPollutionSensorData data) {
        if (data.getId() == null) {
            data.setId(UUID.randomUUID());
        }
        return ResponseEntity.ok(sensorDataService.saveAirPollutionData(data));
    }

    @PostMapping("/street-light")
    public ResponseEntity<StreetLightSensorData> addStreetLightData(@RequestBody StreetLightSensorData data) {
        if (data.getId() == null) {
            data.setId(UUID.randomUUID());
        }
        return ResponseEntity.ok(sensorDataService.saveStreetLightData(data));
    }
}