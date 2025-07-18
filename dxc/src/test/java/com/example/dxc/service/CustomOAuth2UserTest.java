package com.example.dxc.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CustomOAuth2UserTest {

    private OAuth2User mockOAuth2User;
    private CustomOAuth2User customOAuth2User;

    @BeforeEach
    void setUp() {
        mockOAuth2User = Mockito.mock(OAuth2User.class);
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("email", "test@example.com");
        attributes.put("sub", "12345");

        when(mockOAuth2User.getAttribute("email")).thenReturn("test@example.com");
        when(mockOAuth2User.getAttribute("sub")).thenReturn("12345");
        when(mockOAuth2User.getAttributes()).thenReturn(attributes);
        when(mockOAuth2User.getAuthorities()).thenReturn(Collections.emptyList());

        customOAuth2User = new CustomOAuth2User(mockOAuth2User);
    }

    @Test
    void testGetEmail() {
        assertEquals("test@example.com", customOAuth2User.getEmail());
    }

    @Test
    void testGetName() {
        assertEquals("12345", customOAuth2User.getName());
    }

    @Test
    void testGetAttributes() {
        Map<String, Object> attributes = customOAuth2User.getAttributes();
        assertEquals("test@example.com", attributes.get("email"));
        assertEquals("12345", attributes.get("sub"));
    }

    @Test
    void testGetAuthorities() {
        Collection<? extends GrantedAuthority> authorities = customOAuth2User.getAuthorities();
        assertTrue(authorities.isEmpty());
    }
}
