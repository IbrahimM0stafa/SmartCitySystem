package com.example.dxc.dto;

import com.example.dxc.model.Alert;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private String message;
    private int count;
    private List<Alert> data;
}
