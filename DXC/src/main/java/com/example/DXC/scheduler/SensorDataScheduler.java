package com.example.DXC.scheduler;

import com.example.DXC.service.SensorDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SensorDataScheduler {

    private final SensorDataService sensorDataService;

    @Scheduled(fixedRate = 20000)
    public void generateAllSensorData() {
        sensorDataService.generateTrafficData();
        sensorDataService.generateAirPollutionData();
        sensorDataService.generateStreetLightData();
    }
}
