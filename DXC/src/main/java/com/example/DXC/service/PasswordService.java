package com.example.DXC.service;

public interface PasswordService {
    String initiatePasswordChange(String email, String oldPassword);
    String verifyAndChangePassword(String email, String otp, String newPassword);
}
