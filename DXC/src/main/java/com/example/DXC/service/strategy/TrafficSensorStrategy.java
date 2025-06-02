package com.example.DXC.service.strategy;

import com.example.DXC.model.TrafficSensorData;
import com.example.DXC.repository.TrafficSensorDataRepository;
import com.example.DXC.service.SensorDataValidator;
import com.example.DXC.service.SettingsService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class TrafficSensorStrategy extends AbstractSensorDataStrategy<TrafficSensorData> {

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public TrafficSensorStrategy(
            TrafficSensorDataRepository repository,
            SensorDataValidator validator,
            SettingsService settingsService) {
        super(repository, validator, settingsService);
    }

    @Override
    protected TrafficSensorData createSensorSpecificData() {
        return TrafficSensorData.builder()
                .location("Street " + (random.nextInt(100) + 1))
                .trafficDensity(random.nextInt(501))
                .avgSpeed(random.nextFloat() * 120)
                .congestionLevel(TrafficSensorData.CongestionLevel.values()[random.nextInt(4)])
                .build();
    }

    @Override
    protected void validateSensorSpecificData(TrafficSensorData data) {
        validator.validateTrafficData(data);
    }

    @Override
    protected void checkSensorSpecificAlerts(TrafficSensorData data) {
        settingsService.checkAndTriggerAlert("trafficDensity", data.getTrafficDensity());
        settingsService.checkAndTriggerAlert("avgSpeed", data.getAvgSpeed());
    }

    @Override
    protected void logSensorSpecificData(TrafficSensorData data) {
        System.out.printf("Traffic Density: %d%n", data.getTrafficDensity());
        System.out.printf("Avg Speed: %.2f%n", data.getAvgSpeed());
        System.out.printf("Congestion Level: %s%n", data.getCongestionLevel());
    }

    @Override
    protected String getStatusFieldName() {
        return "congestionLevel";
    }

    // Helper methods for common fields
    @Override
    protected void ensureCommonFields(TrafficSensorData data) {
        if (data.getId() == null) {
            data.setId(UUID.randomUUID());
        }
        if (data.getTimestamp() == null) {
            data.setTimestamp(LocalDateTime.now());
        }
    }

    @Override
    protected UUID extractId(TrafficSensorData data) {
        return data.getId();
    }

    @Override
    protected String extractLocation(TrafficSensorData data) {
        return data.getLocation();
    }

    @Override
    protected LocalDateTime extractTimestamp(TrafficSensorData data) {
        return data.getTimestamp();
    }
}