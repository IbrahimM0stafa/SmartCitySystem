package com.example.dxc.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PasswordChangeRequestTest {

    @Test
    void testEmailAndOldPassword() {
        PasswordChangeRequest request = new PasswordChangeRequest();

        request.setEmail("user@example.com");
        request.setOldPassword("oldPass123");

        assertEquals("user@example.com", request.getEmail());
        assertEquals("oldPass123", request.getOldPassword());
    }
}
