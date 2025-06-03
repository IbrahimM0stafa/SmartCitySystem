package com.example.DXC.service.strategy;

import com.example.DXC.model.AirPollutionSensorData;
import com.example.DXC.repository.AirPollutionSensorDataRepository;
import com.example.DXC.service.SensorDataValidator;
import com.example.DXC.service.SettingsService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class AirPollutionSensorStrategy extends AbstractSensorDataStrategy<AirPollutionSensorData> {

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public AirPollutionSensorStrategy(
            AirPollutionSensorDataRepository repository,
            SensorDataValidator validator,
            SettingsService settingsService) {
        super(repository, validator, settingsService);
    }

    @Override
    protected AirPollutionSensorData createSensorSpecificData() {
        return AirPollutionSensorData.builder()
                .location("Zone " + (random.nextInt(30) + 1))
                .pm2_5(random.nextFloat() * 100)
                .pm10(random.nextFloat() * 150)
                .co(random.nextFloat() * 50)
                .no2(random.nextFloat() * 40)
                .so2(random.nextFloat() * 20)
                .ozone(random.nextFloat() * 300)
                .pollutionLevel(AirPollutionSensorData.PollutionLevel.values()[random.nextInt(5)])
                .build();
    }

    @Override
    protected void validateSensorSpecificData(AirPollutionSensorData data) {
        validator.validateAirPollutionData(data);
    }

    @Override
    protected void checkSensorSpecificAlerts(AirPollutionSensorData data) {
        settingsService.checkAndTriggerAlert("co", data.getCo());
        settingsService.checkAndTriggerAlert("ozone", data.getOzone());
    }

    @Override
    protected void logSensorSpecificData(AirPollutionSensorData data) {
        System.out.printf("PM2.5: %.2f μg/m³%n", data.getPm2_5());
        System.out.printf("PM10: %.2f μg/m³%n", data.getPm10());
        System.out.printf("CO: %.2f ppm%n", data.getCo());
        System.out.printf("NO2: %.2f%n", data.getNo2());
        System.out.printf("SO2: %.2f%n", data.getSo2());
        System.out.printf("Ozone: %.2f ppb%n", data.getOzone());
        System.out.printf("Pollution Level: %s%n", data.getPollutionLevel());
    }

    @Override
    protected String getStatusFieldName() {
        return "pollutionLevel";
    }

    // Helper methods for common fields
    @Override
    protected void ensureCommonFields(AirPollutionSensorData data) {
        if (data.getId() == null) {
            data.setId(UUID.randomUUID());
        }
        if (data.getTimestamp() == null) {
            data.setTimestamp(LocalDateTime.now());
        }
    }

    @Override
    protected UUID extractId(AirPollutionSensorData data) {
        return data.getId();
    }

    @Override
    protected String extractLocation(AirPollutionSensorData data) {
        return data.getLocation();
    }

    @Override
    protected LocalDateTime extractTimestamp(AirPollutionSensorData data) {
        return data.getTimestamp();
    }
}