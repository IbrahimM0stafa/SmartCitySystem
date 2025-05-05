package com.example.DXC.service;

import com.example.DXC.model.AirPollutionSensorData;
import com.example.DXC.model.StreetLightSensorData;
import com.example.DXC.model.TrafficSensorData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SensorDataServiceImpl implements SensorDataService {

    private final TrafficSensorDataRepository trafficRepo;
    private final AirPollutionSensorDataRepository airRepo;
    private final StreetLightSensorDataRepository lightRepo;

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
        trafficRepo.save(data);
        System.out.println("🚦 Traffic data inserted");
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
        airRepo.save(data);
        System.out.println("🌫️ Air pollution data inserted");
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
        lightRepo.save(data);
        System.out.println("💡 Street light data inserted");
    }
}
