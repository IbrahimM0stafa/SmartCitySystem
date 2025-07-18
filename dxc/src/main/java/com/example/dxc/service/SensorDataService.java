package com.example.dxc.service;

import com.example.dxc.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

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

}
