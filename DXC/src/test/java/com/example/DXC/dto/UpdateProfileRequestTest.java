package com.example.dxc.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UpdateProfileRequestTest {

    @Test
    void testGettersAndSetters() {
        UpdateProfileRequest request = new UpdateProfileRequest();

        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhoneNumber("1234567890");
        request.setAge(30);
        request.setGender("Male");
        request.setProfilePicture("profile.jpg");

        assertEquals("John", request.getFirstName());
        assertEquals("Doe", request.getLastName());
        assertEquals("1234567890", request.getPhoneNumber());
        assertEquals(30, request.getAge());
        assertEquals("Male", request.getGender());
        assertEquals("profile.jpg", request.getProfilePicture());
    }
}
