package com.example.dxc.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class JwtResponseTest {

    @Test
    void testConstructorAndGetters() {
        String token = "mock-token";
        Long id = 100L;
        String email = "user@example.com";

        JwtResponse response = new JwtResponse(token, id, email);

        assertEquals("mock-token", response.getToken());
        assertEquals(100L, response.getId());
        assertEquals("user@example.com", response.getEmail());
    }
}
