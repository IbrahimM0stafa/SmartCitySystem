package com.example.DXC.repository;

import com.example.DXC.model.Settings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SettingsRepository extends JpaRepository<Settings, UUID> {

}
