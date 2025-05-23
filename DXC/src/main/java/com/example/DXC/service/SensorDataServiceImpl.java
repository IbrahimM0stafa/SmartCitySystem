package com.example.DXC.service;

import com.example.DXC.model.*;
import com.example.DXC.repository.*;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Concrete implementation of {@link SensorDataService}.
 *
 * REPOSITORY REQUIREMENTS
 * • Each repository must extend both JpaRepository<T, UUID> and JpaSpecificationExecutor<T>
 *   (so Spring Data can apply Specifications with paging/sorting).
 */
@Service
@RequiredArgsConstructor
public class SensorDataServiceImpl implements SensorDataService {

    /* ----------------------------------------------------------------
       DEPENDENCIES
       ---------------------------------------------------------------- */
    private final TrafficSensorDataRepository      trafficRepo;
    private final AirPollutionSensorDataRepository airRepo;
    private final StreetLightSensorDataRepository  lightRepo;

    private final SensorDataValidator validator;
    private final SettingsService      settingsService;

    /* ----------------------------------------------------------------
       HELPERS
       ---------------------------------------------------------------- */
    private final Random            random    = new Random();
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /* ================================================================
       RANDOM-DATA GENERATION
       ================================================================ */
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

        validator.validateTrafficData(data);
        TrafficSensorData saved = trafficRepo.save(data);

        settingsService.checkAndTriggerAlert("trafficDensity", saved.getTrafficDensity());
        settingsService.checkAndTriggerAlert("avgSpeed",       saved.getAvgSpeed());

        logTraffic(saved, "TRAFFIC DATA INSERTED");
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

        validator.validateAirPollutionData(data);
        AirPollutionSensorData saved = airRepo.save(data);

        settingsService.checkAndTriggerAlert("co",    saved.getCo());
        settingsService.checkAndTriggerAlert("ozone", saved.getOzone());

        logAir(saved, "AIR POLLUTION DATA INSERTED");
    }

    @Override
    public void generateStreetLightData() {
        StreetLightSensorData data = StreetLightSensorData.builder()
                .id(UUID.randomUUID())
                .location("LightPole-" + random.nextInt(100))
                .timestamp(LocalDateTime.now())
                .brightnessLevel(random.nextInt(101))
                .powerConsumption(random.nextFloat() * 5000)
                .status(random.nextBoolean() ? StreetLightSensorData.LightStatus.ON
                        : StreetLightSensorData.LightStatus.OFF)
                .build();

        validator.validateStreetLightData(data);
        StreetLightSensorData saved = lightRepo.save(data);

        settingsService.checkAndTriggerAlert("brightnessLevel",  saved.getBrightnessLevel());
        settingsService.checkAndTriggerAlert("powerConsumption", saved.getPowerConsumption());

        logLight(saved, "STREET LIGHT DATA INSERTED");
    }

    /* ================================================================
       MANUAL SAVE
       ================================================================ */
    @Override
    public TrafficSensorData saveTrafficData(TrafficSensorData data) {
        ensureIdAndTimestamp(data);
        validator.validateTrafficData(data);
        TrafficSensorData saved = trafficRepo.save(data);

        settingsService.checkAndTriggerAlert("trafficDensity", saved.getTrafficDensity());
        settingsService.checkAndTriggerAlert("avgSpeed",       saved.getAvgSpeed());

        logTraffic(saved, "MANUAL TRAFFIC DATA INSERTED");
        return saved;
    }

    @Override
    public AirPollutionSensorData saveAirPollutionData(AirPollutionSensorData data) {
        ensureIdAndTimestamp(data);
        validator.validateAirPollutionData(data);
        AirPollutionSensorData saved = airRepo.save(data);

        settingsService.checkAndTriggerAlert("co",    saved.getCo());
        settingsService.checkAndTriggerAlert("ozone", saved.getOzone());

        logAir(saved, "MANUAL AIR POLLUTION DATA INSERTED");
        return saved;
    }

    @Override
    public StreetLightSensorData saveStreetLightData(StreetLightSensorData data) {
        ensureIdAndTimestamp(data);
        validator.validateStreetLightData(data);
        StreetLightSensorData saved = lightRepo.save(data);

        settingsService.checkAndTriggerAlert("brightnessLevel",  saved.getBrightnessLevel());
        settingsService.checkAndTriggerAlert("powerConsumption", saved.getPowerConsumption());

        logLight(saved, "MANUAL STREET LIGHT DATA INSERTED");
        return saved;
    }

    /* ================================================================
       DASHBOARD — PAGED + SORTABLE + FILTERABLE   🚀
       ================================================================ */
    @Override
    public Page<TrafficSensorData> getTrafficData(
            String location,
            TrafficSensorData.CongestionLevel level,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable) {

        Specification<TrafficSensorData> spec = buildTrafficSpec(location, level, start, end);
        return trafficRepo.findAll(spec, pageable);
    }

    @Override
    public Page<AirPollutionSensorData> getAirPollutionData(
            String location,
            AirPollutionSensorData.PollutionLevel level,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable) {

        Specification<AirPollutionSensorData> spec = buildAirSpec(location, level, start, end);
        return airRepo.findAll(spec, pageable);
    }

    @Override
    public Page<StreetLightSensorData> getStreetLightData(
            String location,
            StreetLightSensorData.LightStatus status,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable) {

        Specification<StreetLightSensorData> spec = buildLightSpec(location, status, start, end);
        return lightRepo.findAll(spec, pageable);
    }

    /* ================================================================
       LIST-STYLE FILTERING HELPERS (used by other layers/tests)
       ================================================================ */
    @Override
    public List<TrafficSensorData> filterTrafficData(
            String location,
            TrafficSensorData.CongestionLevel level,
            LocalDateTime start,
            LocalDateTime end) {

        Specification<TrafficSensorData> spec = buildTrafficSpec(location, level, start, end);
        return trafficRepo.findAll(spec, Sort.unsorted());
    }

    @Override
    public List<AirPollutionSensorData> filterAirPollutionData(
            String location,
            AirPollutionSensorData.PollutionLevel level,
            LocalDateTime start,
            LocalDateTime end) {

        Specification<AirPollutionSensorData> spec = buildAirSpec(location, level, start, end);
        return airRepo.findAll(spec, Sort.unsorted());
    }

    @Override
    public List<StreetLightSensorData> filterStreetLightData(
            String location,
            StreetLightSensorData.LightStatus status,
            LocalDateTime start,
            LocalDateTime end) {

        Specification<StreetLightSensorData> spec = buildLightSpec(location, status, start, end);
        return lightRepo.findAll(spec, Sort.unsorted());
    }

    /* ================================================================
       PRIVATE HELPERS
       ================================================================ */
    private void ensureIdAndTimestamp(Object entity) {
        if (entity instanceof BaseSensorData base) {
            if (base.getId() == null)        base.setId(UUID.randomUUID());
            if (base.getTimestamp() == null) base.setTimestamp(LocalDateTime.now());
        }
    }

    /* ---------- SPEC BUILDERS ---------- */

    private Specification<TrafficSensorData> buildTrafficSpec(
            String location,
            TrafficSensorData.CongestionLevel level,
            LocalDateTime start,
            LocalDateTime end) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (location != null) predicates.add(cb.equal(root.get("location"), location));
            if (level != null)    predicates.add(cb.equal(root.get("congestionLevel"), level));
            if (start != null)    predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), start));
            if (end != null)      predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), end));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Specification<AirPollutionSensorData> buildAirSpec(
            String location,
            AirPollutionSensorData.PollutionLevel level,
            LocalDateTime start,
            LocalDateTime end) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (location != null) predicates.add(cb.equal(root.get("location"), location));
            if (level != null)    predicates.add(cb.equal(root.get("pollutionLevel"), level));
            if (start != null)    predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), start));
            if (end != null)      predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), end));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Specification<StreetLightSensorData> buildLightSpec(
            String location,
            StreetLightSensorData.LightStatus status,
            LocalDateTime start,
            LocalDateTime end) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (location != null) predicates.add(cb.equal(root.get("location"), location));
            if (status != null)   predicates.add(cb.equal(root.get("status"), status));
            if (start != null)    predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), start));
            if (end != null)      predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), end));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    /* ---------- CONSOLE LOGGING ---------- */

    private void logTraffic(TrafficSensorData d, String header) {
        System.out.println("\n " + header + ':');
        System.out.printf("""
                ID: %s
                Location: %s
                Timestamp: %s
                Traffic Density: %d
                Average Speed: %.2f
                Congestion Level: %s
                -----------------------------%n
                """, d.getId(), d.getLocation(),
                d.getTimestamp().format(formatter),
                d.getTrafficDensity(), d.getAvgSpeed(), d.getCongestionLevel());
    }

    private void logAir(AirPollutionSensorData d, String header) {
        System.out.println("\n " + header + ':');
        System.out.printf("""
                ID: %s
                Location: %s
                Timestamp: %s
                PM2_5: %.2f
                PM10: %.2f
                CO: %.2f ppm
                NO2: %.2f
                SO2: %.2f
                Ozone: %.2f ppb
                Pollution Level: %s
                -----------------------------%n
                """, d.getId(), d.getLocation(),
                d.getTimestamp().format(formatter),
                d.getPm2_5(), d.getPm10(), d.getCo(), d.getNo2(),
                d.getSo2(), d.getOzone(), d.getPollutionLevel());
    }

    private void logLight(StreetLightSensorData d, String header) {
        System.out.println("\n " + header + ':');
        System.out.printf("""
                ID: %s
                Location: %s
                Timestamp: %s
                Brightness Level: %d
                Power Consumption: %.2f
                Status: %s
                -----------------------------%n
                """, d.getId(), d.getLocation(),
                d.getTimestamp().format(formatter),
                d.getBrightnessLevel(), d.getPowerConsumption(), d.getStatus());
    }

    /* ---------- INTERNAL GENERIC BASE INTERFACE ---------- */
    private interface BaseSensorData {
        UUID          getId();
        void          setId(UUID id);
        LocalDateTime getTimestamp();
        void          setTimestamp(LocalDateTime ts);
    }
}
