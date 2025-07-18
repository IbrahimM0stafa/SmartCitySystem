package com.example.dxc.service.strategy;

import com.example.dxc.service.SensorDataValidator;
import com.example.dxc.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RequiredArgsConstructor
public abstract class AbstractSensorDataStrategy<T> implements SensorDataStrategy<T> {

    // Repository that supports both JpaRepository and JpaSpecificationExecutor
    protected final JpaRepository<T, UUID> repository;
    protected final SensorDataValidator validator;
    protected final SettingsService settingsService;
    protected final Random random = new Random();
    private static final Logger logger = LoggerFactory.getLogger(AbstractSensorDataStrategy.class);


    // Template method for data generation
    @Override
    public final T generateData() {
        T data = createSensorSpecificData();
        ensureCommonFields(data);
        return data;
    }

    // Template method for validation
    @Override
    public final void validate(T data) {
        validateSensorSpecificData(data);
    }

    // Template method for saving
    @Override
    public final T save(T data) {
        return repository.save(data);
    }

    // Template method for alerts
    @Override
    public final void checkAlerts(T data) {
        checkSensorSpecificAlerts(data);
    }

    // Template method for querying - eliminates all duplication
    @Override
    public final Page<T> getData(String location, Enum<?> status, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        // Ensure repository supports JpaSpecificationExecutor
        if (!(repository instanceof JpaSpecificationExecutor)) {
            throw new IllegalStateException("Repository must implement JpaSpecificationExecutor for query operations");
        }

        Specification<T> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (location != null) predicates.add(cb.equal(root.get("location"), location));
            if (status != null) predicates.add(cb.equal(root.get(getStatusFieldName()), status));
            if (start != null) predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), start));
            if (end != null) predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), end));
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        @SuppressWarnings("unchecked")
        JpaSpecificationExecutor<T> specExecutor = (JpaSpecificationExecutor<T>) repository;
        return specExecutor.findAll(spec, pageable);
    }

// Template method for logging
@Override
public final void log(T data, String header) {
    logger.info("{}:", header);

    if (data != null) {
        Object id = extractId(data);
        Object location = extractLocation(data);
        Object timestamp = extractTimestamp(data);

        if (id != null) logger.info("ID: {}", id);
        if (location != null) logger.info("Location: {}", location);
        if (timestamp != null) logger.info("Timestamp: {}", timestamp);

        logSensorSpecificData(data);
    } else {
        logger.warn("No data available to log.");
    }

    logger.info("----------------------");
}



    // Abstract methods that concrete strategies must implement
    protected abstract T createSensorSpecificData();
    protected abstract void validateSensorSpecificData(T data);
    protected abstract void checkSensorSpecificAlerts(T data);
    protected abstract void logSensorSpecificData(T data);
    protected abstract String getStatusFieldName();

    // Abstract helper methods for common fields (each strategy implements for its type)
    protected abstract void ensureCommonFields(T data);
    protected abstract UUID extractId(T data);
    protected abstract String extractLocation(T data);
    protected abstract LocalDateTime extractTimestamp(T data);
}
