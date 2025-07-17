package com.example.dxc.service;

import com.example.dxc.model.*;
import com.example.dxc.service.strategy.SensorDataStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SensorDataServiceImpl implements SensorDataService {

    private final Map<Class<?>, SensorDataStrategy<?>> strategies;

    @Autowired
    public SensorDataServiceImpl(List<SensorDataStrategy<?>> strategyList) {
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(
                        this::extractGenericType,
                        Function.identity()
                ));
    }

    private Class<?> extractGenericType(SensorDataStrategy<?> strategy) {
        // Get the actual class of the strategy implementation
        Class<?> strategyClass = strategy.getClass();

        // Look for the generic superclass (AbstractSensorDataStrategy)
        Type genericSuperclass = strategyClass.getGenericSuperclass();

        if (genericSuperclass instanceof ParameterizedType) {
            ParameterizedType paramType = (ParameterizedType) genericSuperclass;
            return (Class<?>) paramType.getActualTypeArguments()[0];
        }

        // Fallback: look through interfaces
        Type[] genericInterfaces = strategyClass.getGenericInterfaces();
        for (Type genericInterface : genericInterfaces) {
            if (genericInterface instanceof ParameterizedType) {
                ParameterizedType paramType = (ParameterizedType) genericInterface;
                if (paramType.getRawType().equals(SensorDataStrategy.class)) {
                    return (Class<?>) paramType.getActualTypeArguments()[0];
                }
            }
        }

        throw new IllegalArgumentException("Could not determine generic type for strategy: " + strategyClass);
    }

    @SuppressWarnings("unchecked")
    private <T> SensorDataStrategy<T> getStrategy(Class<T> type) {
        SensorDataStrategy<T> strategy = (SensorDataStrategy<T>) strategies.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("No strategy found for type: " + type.getSimpleName());
        }
        return strategy;
    }

    @Override
    public void generateTrafficData() {
        executeStrategy(TrafficSensorData.class, "TRAFFIC DATA INSERTED");
    }

    @Override
    public void generateAirPollutionData() {
        executeStrategy(AirPollutionSensorData.class, "AIR POLLUTION DATA INSERTED");
    }

    @Override
    public void generateStreetLightData() {
        executeStrategy(StreetLightSensorData.class, "STREET LIGHT DATA INSERTED");
    }

    private <T> void executeStrategy(Class<T> type, String logHeader) {
        SensorDataStrategy<T> strategy = getStrategy(type);
        T data = strategy.generateData();
        strategy.validate(data);
        T saved = strategy.save(data);
        strategy.checkAlerts(saved);
        strategy.log(saved, logHeader);
    }

    @Override
    public TrafficSensorData saveTrafficData(TrafficSensorData data) {
        return saveSensorData(TrafficSensorData.class, data);
    }

    @Override
    public AirPollutionSensorData saveAirPollutionData(AirPollutionSensorData data) {
        return saveSensorData(AirPollutionSensorData.class, data);
    }

    @Override
    public StreetLightSensorData saveStreetLightData(StreetLightSensorData data) {
        return saveSensorData(StreetLightSensorData.class, data);
    }

    private <T> T saveSensorData(Class<T> type, T data) {
        ensureIdAndTimestamp(data);
        SensorDataStrategy<T> strategy = getStrategy(type);
        strategy.validate(data);
        T saved = strategy.save(data);
        strategy.checkAlerts(saved);
        return saved;
    }

    @Override
    public Page<TrafficSensorData> getTrafficData(
            String location,
            TrafficSensorData.CongestionLevel level,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable) {
        return getStrategy(TrafficSensorData.class)
                .getData(location, level, start, end, pageable);
    }

    @Override
    public Page<AirPollutionSensorData> getAirPollutionData(
            String location,
            AirPollutionSensorData.PollutionLevel level,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable) {
        return getStrategy(AirPollutionSensorData.class)
                .getData(location, level, start, end, pageable);
    }

    @Override
    public Page<StreetLightSensorData> getStreetLightData(
            String location,
            StreetLightSensorData.LightStatus status,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable) {
        return getStrategy(StreetLightSensorData.class)
                .getData(location, status, start, end, pageable);
    }

    private void ensureIdAndTimestamp(Object entity) {
        if (entity instanceof BaseSensorData base) {
            if (base.getId() == null) {
                base.setId(UUID.randomUUID());
            }
            if (base.getTimestamp() == null) {
                base.setTimestamp(LocalDateTime.now());
            }
        }
    }

    private interface BaseSensorData {
        UUID getId();
        void setId(UUID id);
        LocalDateTime getTimestamp();
        void setTimestamp(LocalDateTime ts);
    }
}