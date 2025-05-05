package com.example.DXC.controller;

import com.example.DXC.service.SensorDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sensors")
@RequiredArgsConstructor
public class SensorDataController {

    private final SensorDataService sensorDataService;

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
}
