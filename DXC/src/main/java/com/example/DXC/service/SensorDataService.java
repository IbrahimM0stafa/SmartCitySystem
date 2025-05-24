package com.example.DXC.service;

import com.example.DXC.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface SensorDataService {


    void generateTrafficData();
    void generateAirPollutionData();
    void generateStreetLightData();


    TrafficSensorData      saveTrafficData(TrafficSensorData data);
    AirPollutionSensorData saveAirPollutionData(AirPollutionSensorData data);
    StreetLightSensorData  saveStreetLightData(StreetLightSensorData data);


    Page<TrafficSensorData> getTrafficData(
            String location,
            TrafficSensorData.CongestionLevel congestionLevel,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    );

    Page<AirPollutionSensorData> getAirPollutionData(
            String location,
            AirPollutionSensorData.PollutionLevel pollutionLevel,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    );

    Page<StreetLightSensorData> getStreetLightData(
            String location,
            StreetLightSensorData.LightStatus status,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    );


    List<TrafficSensorData> filterTrafficData(
            String location,
            TrafficSensorData.CongestionLevel congestionLevel,
            LocalDateTime start,
            LocalDateTime end
    );

    List<AirPollutionSensorData> filterAirPollutionData(
            String location,
            AirPollutionSensorData.PollutionLevel pollutionLevel,
            LocalDateTime start,
            LocalDateTime end
    );

    List<StreetLightSensorData> filterStreetLightData(
            String location,
            StreetLightSensorData.LightStatus status,
            LocalDateTime start,
            LocalDateTime end
    );
}
