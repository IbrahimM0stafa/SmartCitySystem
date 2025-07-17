package com.example.dxc.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SignInRequestTest {

    @Test
    void testEmailAndPasswordFields() {
        SignInRequest request = new SignInRequest();
        request.setEmail("test@example.com");
        request.setPassword("secret123");

        assertEquals("test@example.com", request.getEmail());
        assertEquals("secret123", request.getPassword());
    }

    @Test
    void testSystemIdMethods() {
        SignInRequest request = new SignInRequest();

        // setSystemId does nothing
        request.setSystemId("abc");

        // getSystemId returns empty string
        assertEquals("", request.getSystemId());
    }
}
