package com.example.dxc.repository;

import com.example.dxc.model.Settings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SettingsRepository extends JpaRepository<Settings, UUID> {

}
