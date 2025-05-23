package com.example.DXC.controller;

import com.example.DXC.model.*;
import com.example.DXC.service.SensorDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/sensors")
@RequiredArgsConstructor
public class SensorDataController {

    private final SensorDataService sensorDataService;

    /* ================================================================
       RANDOM-DATA GENERATION ENDPOINTS
       ================================================================ */
    @PostMapping("/generate/traffic")
    public String generateTrafficData() {
        sensorDataService.generateTrafficData();
        return "✅ Traffic data generated successfully.";
    }

    @PostMapping("/generate/air-pollution")
    public String generateAirPollutionData() {
        sensorDataService.generateAirPollutionData();
        return "✅ Air-pollution data generated successfully.";
    }

    @PostMapping("/generate/street-light")
    public String generateStreetLightData() {
        sensorDataService.generateStreetLightData();
        return "✅ Street-light data generated successfully.";
    }

    @PostMapping("/generate/all")
    public String generateAllData() {
        sensorDataService.generateTrafficData();
        sensorDataService.generateAirPollutionData();
        sensorDataService.generateStreetLightData();
        return "✅ All sensor-data types generated successfully.";
    }

    /* ================================================================
       MANUAL DATA-INSERT ENDPOINTS
       ================================================================ */
    @PostMapping("/traffic")
    public ResponseEntity<TrafficSensorData> addTrafficData(@RequestBody TrafficSensorData data) {
        if (data.getId() == null) data.setId(UUID.randomUUID());
        return ResponseEntity.ok(sensorDataService.saveTrafficData(data));
    }

    @PostMapping("/air-pollution")
    public ResponseEntity<AirPollutionSensorData> addAirPollutionData(@RequestBody AirPollutionSensorData data) {
        if (data.getId() == null) data.setId(UUID.randomUUID());
        return ResponseEntity.ok(sensorDataService.saveAirPollutionData(data));
    }

    @PostMapping("/street-light")
    public ResponseEntity<StreetLightSensorData> addStreetLightData(@RequestBody StreetLightSensorData data) {
        if (data.getId() == null) data.setId(UUID.randomUUID());
        return ResponseEntity.ok(sensorDataService.saveStreetLightData(data));
    }

    /* ================================================================
       DASHBOARD  —  PAGED  +  SORTABLE  +  FILTERABLE   🚀  (NEW)
       ================================================================ */

    @GetMapping("/traffic")
    public ResponseEntity<Page<TrafficSensorData>> getTraffic(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc")      String order,
            /* ---- optional filters ---- */
            @RequestParam(required = false) String location,
            @RequestParam(required = false) TrafficSensorData.CongestionLevel congestionLevel,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        Pageable pageable = PageRequest.of(page, size,
                order.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending());

        return ResponseEntity.ok(
                sensorDataService.getTrafficData(location, congestionLevel, start, end, pageable)
        );
    }

    @GetMapping("/air-pollution")
    public ResponseEntity<Page<AirPollutionSensorData>> getAirPollution(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc")      String order,
            /* ---- optional filters ---- */
            @RequestParam(required = false) String location,
            @RequestParam(required = false) AirPollutionSensorData.PollutionLevel pollutionLevel,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        Pageable pageable = PageRequest.of(page, size,
                order.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending());

        return ResponseEntity.ok(
                sensorDataService.getAirPollutionData(location, pollutionLevel, start, end, pageable)
        );
    }

    @GetMapping("/street-light")
    public ResponseEntity<Page<StreetLightSensorData>> getStreetLight(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc")      String order,
            /* ---- optional filters ---- */
            @RequestParam(required = false) String location,
            @RequestParam(required = false) StreetLightSensorData.LightStatus status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        Pageable pageable = PageRequest.of(page, size,
                order.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending());

        return ResponseEntity.ok(
                sensorDataService.getStreetLightData(location, status, start, end, pageable)
        );
    }
}
