package com.example.dxc.controller;

import com.example.dxc.dto.PasswordChangeRequest;
import com.example.dxc.dto.PasswordOtpVerificationRequest;
import com.example.dxc.service.PasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class PasswordController {

    @Autowired
    PasswordService passwordService;

    @PostMapping("/change-password-request")
    public ResponseEntity<?> requestPasswordChange(@RequestBody PasswordChangeRequest request) {
        try {
            String message = passwordService.initiatePasswordChange(request.getEmail(), request.getOldPassword());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @PostMapping("/verify-password-change")
    public ResponseEntity<?> verifyPasswordChange(@RequestBody PasswordOtpVerificationRequest request) {
        try {
            String message = passwordService.verifyAndChangePassword(request.getEmail(), request.getOtp(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

    }
}
