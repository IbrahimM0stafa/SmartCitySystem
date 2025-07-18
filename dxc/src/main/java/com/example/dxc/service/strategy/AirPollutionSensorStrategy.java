package com.example.dxc.service.strategy;

import com.example.dxc.model.AirPollutionSensorData;
import com.example.dxc.repository.AirPollutionSensorDataRepository;
import com.example.dxc.service.SensorDataValidator;
import com.example.dxc.service.SettingsService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class AirPollutionSensorStrategy extends AbstractSensorDataStrategy<AirPollutionSensorData> {
    private static final Logger logger = LoggerFactory.getLogger(AirPollutionSensorStrategy.class);


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
        logger.info("PM2.5: {} μg/m³", String.format("%.2f", data.getPm2_5()));
        logger.info("PM10: {} μg/m³", String.format("%.2f", data.getPm10()));
        logger.info("CO: {} ppm", String.format("%.2f", data.getCo()));
        logger.info("NO2: {}", String.format("%.2f", data.getNo2()));
        logger.info("SO2: {}", String.format("%.2f", data.getSo2()));
        logger.info("Ozone: {} ppb", String.format("%.2f", data.getOzone()));
        logger.info("Pollution Level: {}", data.getPollutionLevel());
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
