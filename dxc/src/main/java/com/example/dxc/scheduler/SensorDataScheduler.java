package com.example.dxc.scheduler;

import com.example.dxc.service.SensorDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SensorDataScheduler {

    private final SensorDataService sensorDataService;

    @Scheduled(fixedRate = 60000)
    public void generateAllSensorData() {
        sensorDataService.generateTrafficData();
        sensorDataService.generateAirPollutionData();
        sensorDataService.generateStreetLightData();
    }
}
