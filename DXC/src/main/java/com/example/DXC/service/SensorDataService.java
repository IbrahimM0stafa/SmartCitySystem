package com.example.DXC.service;

import com.example.DXC.model.AirPollutionSensorData;
import com.example.DXC.model.StreetLightSensorData;
import com.example.DXC.model.TrafficSensorData;

public interface SensorDataService {
    // Random data generation methods
    void generateTrafficData();
    void generateAirPollutionData();
    void generateStreetLightData();

    // Manual data saving methods
    TrafficSensorData saveTrafficData(TrafficSensorData data);
    AirPollutionSensorData saveAirPollutionData(AirPollutionSensorData data);
    StreetLightSensorData saveStreetLightData(StreetLightSensorData data);
}