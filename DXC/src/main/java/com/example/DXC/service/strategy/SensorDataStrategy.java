
package com.example.DXC.service.strategy;

import com.example.DXC.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

public interface SensorDataStrategy<T> {
    T generateData();
    void validate(T data);
    T save(T data);
    void checkAlerts(T savedData);
    Page<T> getData(String location, Enum<?> status, LocalDateTime start, LocalDateTime end, Pageable pageable);
    void log(T data, String header);
}