package com.example.dxc.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

class UserDetailsImplTest {

    private User user;
    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("securePassword123")
                .phoneNumber("1234567890")
                .profilePicture("profile.jpg")
                .gender("Male")
                .age(30)
                .authProvider("local")
                .build();

        userDetails = new UserDetailsImpl(user);
    }

    @Test
    void testGetUsernameReturnsEmail() {
        assertEquals("john.doe@example.com", userDetails.getUsername());
    }

    @Test
    void testGetPassword() {
        assertEquals("securePassword123", userDetails.getPassword());
    }

    @Test
    void testGetAuthorities() {
        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
        assertEquals(1, authorities.size());
        assertEquals("ROLE_USER", authorities.iterator().next().getAuthority());
    }

    @Test
    void testIsAccountNonExpired() {
        assertTrue(userDetails.isAccountNonExpired());
    }

    @Test
    void testIsAccountNonLocked() {
        assertTrue(userDetails.isAccountNonLocked());
    }

    @Test
    void testIsCredentialsNonExpired() {
        assertTrue(userDetails.isCredentialsNonExpired());
    }

    @Test
    void testIsEnabled() {
        assertTrue(userDetails.isEnabled());
    }

    @Test
    void testGetUserReturnsCorrectUser() {
        assertEquals(user, userDetails.getUser());
    }
}
