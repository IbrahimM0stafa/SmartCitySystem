package com.example.DXC.service;

import com.example.DXC.model.*;
import com.example.DXC.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SensorDataServiceImpl implements SensorDataService {

    private final TrafficSensorDataRepository trafficRepo;
    private final AirPollutionSensorDataRepository airRepo;
    private final StreetLightSensorDataRepository lightRepo;
    private final SensorDataValidator validator;
    private final SettingsService settingsService;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final Random random = new Random();

    @Override
    public void generateTrafficData() {
        TrafficSensorData data = TrafficSensorData.builder()
                .id(UUID.randomUUID())
                .location("Street " + (random.nextInt(100) + 1))
                .timestamp(LocalDateTime.now())
                .trafficDensity(random.nextInt(501))
                .avgSpeed(random.nextFloat() * 120)
                .congestionLevel(TrafficSensorData.CongestionLevel.values()[random.nextInt(4)])
                .build();

        // Validate before saving
        validator.validateTrafficData(data);

        TrafficSensorData saved = trafficRepo.save(data);

        // Check for alerts
        settingsService.checkAndTriggerAlert("trafficDensity", saved.getTrafficDensity());
        settingsService.checkAndTriggerAlert("avgSpeed", saved.getAvgSpeed());

        // Print detailed data to console
        System.out.println("\n🚦 TRAFFIC DATA INSERTED:");
        System.out.println("ID: " + saved.getId());
        System.out.println("Location: " + saved.getLocation());
        System.out.println("Timestamp: " + saved.getTimestamp().format(formatter));
        System.out.println("Traffic Density: " + saved.getTrafficDensity());
        System.out.println("Average Speed: " + String.format("%.2f", saved.getAvgSpeed()));
        System.out.println("Congestion Level: " + saved.getCongestionLevel());
        System.out.println("-----------------------------");
    }

    @Override
    public void generateAirPollutionData() {
        AirPollutionSensorData data = AirPollutionSensorData.builder()
                .id(UUID.randomUUID())
                .location("Zone " + (random.nextInt(30) + 1))
                .timestamp(LocalDateTime.now())
                .pm2_5(random.nextFloat() * 100)
                .pm10(random.nextFloat() * 150)
                .co(random.nextFloat() * 50)
                .no2(random.nextFloat() * 40)
                .so2(random.nextFloat() * 20)
                .ozone(random.nextFloat() * 300)
                .pollutionLevel(AirPollutionSensorData.PollutionLevel.values()[random.nextInt(5)])
                .build();

        // Validate before saving
        validator.validateAirPollutionData(data);

        AirPollutionSensorData saved = airRepo.save(data);

        // Check for alerts
        settingsService.checkAndTriggerAlert("co", saved.getCo());
        settingsService.checkAndTriggerAlert("ozone", saved.getOzone());

        // Print detailed data to console
        System.out.println("\n🌫️ AIR POLLUTION DATA INSERTED:");
        System.out.println("ID: " + saved.getId());
        System.out.println("Location: " + saved.getLocation());
        System.out.println("Timestamp: " + saved.getTimestamp().format(formatter));
        System.out.println("PM2.5: " + String.format("%.2f", saved.getPm2_5()));
        System.out.println("PM10: " + String.format("%.2f", saved.getPm10()));
        System.out.println("CO: " + String.format("%.2f", saved.getCo()) + " ppm");
        System.out.println("NO2: " + String.format("%.2f", saved.getNo2()));
        System.out.println("SO2: " + String.format("%.2f", saved.getSo2()));
        System.out.println("Ozone: " + String.format("%.2f", saved.getOzone()) + " ppb");
        System.out.println("Pollution Level: " + saved.getPollutionLevel());
        System.out.println("-----------------------------");
    }

    @Override
    public void generateStreetLightData() {
        StreetLightSensorData data = StreetLightSensorData.builder()
                .id(UUID.randomUUID())
                .location("LightPole-" + random.nextInt(100))
                .timestamp(LocalDateTime.now())
                .brightnessLevel(random.nextInt(101))
                .powerConsumption(random.nextFloat() * 5000)
                .status(random.nextBoolean() ? StreetLightSensorData.LightStatus.ON : StreetLightSensorData.LightStatus.OFF)
                .build();

        // Validate before saving
        validator.validateStreetLightData(data);

        StreetLightSensorData saved = lightRepo.save(data);

        // Check for alerts
        settingsService.checkAndTriggerAlert("brightnessLevel", saved.getBrightnessLevel());
        settingsService.checkAndTriggerAlert("powerConsumption", saved.getPowerConsumption());

        // Print detailed data to console
        System.out.println("\n💡 STREET LIGHT DATA INSERTED:");
        System.out.println("ID: " + saved.getId());
        System.out.println("Location: " + saved.getLocation());
        System.out.println("Timestamp: " + saved.getTimestamp().format(formatter));
        System.out.println("Brightness Level: " + saved.getBrightnessLevel());
        System.out.println("Power Consumption: " + String.format("%.2f", saved.getPowerConsumption()));
        System.out.println("Status: " + saved.getStatus());
        System.out.println("-----------------------------");
    }

    @Override
    public TrafficSensorData saveTrafficData(TrafficSensorData data) {
        // Ensure we have a timestamp if not provided
        if (data.getTimestamp() == null) {
            data.setTimestamp(LocalDateTime.now());
        }

        // Ensure ID exists
        if (data.getId() == null) {
            data.setId(UUID.randomUUID());
        }

        // Validate before saving
        validator.validateTrafficData(data);

        TrafficSensorData saved = trafficRepo.save(data);

        // Check for alerts
        settingsService.checkAndTriggerAlert("trafficDensity", saved.getTrafficDensity());
        settingsService.checkAndTriggerAlert("avgSpeed", saved.getAvgSpeed());

        // Print detailed data to console
        System.out.println("\n🚦 MANUAL TRAFFIC DATA INSERTED:");
        System.out.println("ID: " + saved.getId());
        System.out.println("Location: " + saved.getLocation());
        System.out.println("Timestamp: " + saved.getTimestamp().format(formatter));
        System.out.println("Traffic Density: " + saved.getTrafficDensity());
        System.out.println("Average Speed: " + String.format("%.2f", saved.getAvgSpeed()));
        System.out.println("Congestion Level: " + saved.getCongestionLevel());
        System.out.println("-----------------------------");

        return saved;
    }

    @Override
    public AirPollutionSensorData saveAirPollutionData(AirPollutionSensorData data) {
        // Ensure we have a timestamp if not provided
        if (data.getTimestamp() == null) {
            data.setTimestamp(LocalDateTime.now());
        }

        // Ensure ID exists
        if (data.getId() == null) {
            data.setId(UUID.randomUUID());
        }

        // Validate before saving
        validator.validateAirPollutionData(data);

        AirPollutionSensorData saved = airRepo.save(data);

        // Check for alerts
        settingsService.checkAndTriggerAlert("co", saved.getCo());
        settingsService.checkAndTriggerAlert("ozone", saved.getOzone());

        // Print detailed data to console
        System.out.println("\n🌫️ MANUAL AIR POLLUTION DATA INSERTED:");
        System.out.println("ID: " + saved.getId());
        System.out.println("Location: " + saved.getLocation());
        System.out.println("Timestamp: " + saved.getTimestamp().format(formatter));
        System.out.println("PM2.5: " + String.format("%.2f", saved.getPm2_5()));
        System.out.println("PM10: " + String.format("%.2f", saved.getPm10()));
        System.out.println("CO: " + String.format("%.2f", saved.getCo()) + " ppm");
        System.out.println("NO2: " + String.format("%.2f", saved.getNo2()));
        System.out.println("SO2: " + String.format("%.2f", saved.getSo2()));
        System.out.println("Ozone: " + String.format("%.2f", saved.getOzone()) + " ppb");
        System.out.println("Pollution Level: " + saved.getPollutionLevel());
        System.out.println("-----------------------------");

        return saved;
    }

    @Override
    public StreetLightSensorData saveStreetLightData(StreetLightSensorData data) {
        // Ensure we have a timestamp if not provided
        if (data.getTimestamp() == null) {
            data.setTimestamp(LocalDateTime.now());
        }

        // Ensure ID exists
        if (data.getId() == null) {
            data.setId(UUID.randomUUID());
        }

        // Validate before saving
        validator.validateStreetLightData(data);

        StreetLightSensorData saved = lightRepo.save(data);

        // Check for alerts
        settingsService.checkAndTriggerAlert("brightnessLevel", saved.getBrightnessLevel());
        settingsService.checkAndTriggerAlert("powerConsumption", saved.getPowerConsumption());

        // Print detailed data to console
        System.out.println("\n💡 MANUAL STREET LIGHT DATA INSERTED:");
        System.out.println("ID: " + saved.getId());
        System.out.println("Location: " + saved.getLocation());
        System.out.println("Timestamp: " + saved.getTimestamp().format(formatter));
        System.out.println("Brightness Level: " + saved.getBrightnessLevel());
        System.out.println("Power Consumption: " + String.format("%.2f", saved.getPowerConsumption()));
        System.out.println("Status: " + saved.getStatus());
        System.out.println("-----------------------------");

        return saved;
    }
}