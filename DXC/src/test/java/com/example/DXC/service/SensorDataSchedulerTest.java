package com.example.dxc.service;

import com.example.dxc.scheduler.SensorDataScheduler;
import com.example.dxc.service.SensorDataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;

class SensorDataSchedulerTest {

    private SensorDataService sensorDataService;
    private SensorDataScheduler scheduler;

    @BeforeEach
    void setUp() {
        sensorDataService = mock(SensorDataService.class);
        scheduler = new SensorDataScheduler(sensorDataService);
    }

    @Test
    void testGenerateAllSensorData_shouldCallAllGenerators() {
        // Act
        scheduler.generateAllSensorData();

        // Assert
        verify(sensorDataService, times(1)).generateTrafficData();
        verify(sensorDataService, times(1)).generateAirPollutionData();
        verify(sensorDataService, times(1)).generateStreetLightData();
    }
}
