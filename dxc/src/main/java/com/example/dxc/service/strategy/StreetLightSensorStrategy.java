package com.example.dxc.service.strategy;

import com.example.dxc.model.StreetLightSensorData;
import com.example.dxc.repository.StreetLightSensorDataRepository;
import com.example.dxc.service.SensorDataValidator;
import com.example.dxc.service.SettingsService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class StreetLightSensorStrategy extends AbstractSensorDataStrategy<StreetLightSensorData> {

    private static final Logger logger = LoggerFactory.getLogger(StreetLightSensorStrategy.class);

    public StreetLightSensorStrategy(
            StreetLightSensorDataRepository repository,
            SensorDataValidator validator,
            SettingsService settingsService) {
        super(repository, validator, settingsService);
    }

    @Override
    protected StreetLightSensorData createSensorSpecificData() {
        return StreetLightSensorData.builder()
                .location("LightPole-" + random.nextInt(100))
                .brightnessLevel(random.nextInt(101))
                .powerConsumption(random.nextFloat() * 5000)
                .status(random.nextBoolean() ?
                        StreetLightSensorData.LightStatus.ON :
                        StreetLightSensorData.LightStatus.OFF)
                .build();
    }

    @Override
    protected void validateSensorSpecificData(StreetLightSensorData data) {
        validator.validateStreetLightData(data);
    }

    @Override
    protected void checkSensorSpecificAlerts(StreetLightSensorData data) {
        settingsService.checkAndTriggerAlert("brightnessLevel", data.getBrightnessLevel());
        settingsService.checkAndTriggerAlert("powerConsumption", data.getPowerConsumption());
    }

    @Override
    protected void logSensorSpecificData(StreetLightSensorData data) {
        logger.info("Brightness: {}%", data.getBrightnessLevel());
        logger.info("Power: {} watts", String.format("%.2f", data.getPowerConsumption()));
        logger.info("Status: {}", data.getStatus());
    }


    @Override
    protected String getStatusFieldName() {
        return "status";
    }

    // Helper methods for common fields
    @Override
    protected void ensureCommonFields(StreetLightSensorData data) {
        if (data.getId() == null) {
            data.setId(UUID.randomUUID());
        }
        if (data.getTimestamp() == null) {
            data.setTimestamp(LocalDateTime.now());
        }
    }

    @Override
    protected UUID extractId(StreetLightSensorData data) {
        return data.getId();
    }

    @Override
    protected String extractLocation(StreetLightSensorData data) {
        return data.getLocation();
    }

    @Override
    protected LocalDateTime extractTimestamp(StreetLightSensorData data) {
        return data.getTimestamp();
    }
}
