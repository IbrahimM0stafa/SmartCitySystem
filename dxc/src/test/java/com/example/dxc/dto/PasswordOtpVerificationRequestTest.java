package com.example.dxc.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PasswordOtpVerificationRequestTest {

    @Test
    void testFields() {
        PasswordOtpVerificationRequest request = new PasswordOtpVerificationRequest();

        request.setEmail("test@example.com");
        request.setOtp("123456");
        request.setNewPassword("newSecurePass");

        assertEquals("test@example.com", request.getEmail());
        assertEquals("123456", request.getOtp());
        assertEquals("newSecurePass", request.getNewPassword());
    }
}
