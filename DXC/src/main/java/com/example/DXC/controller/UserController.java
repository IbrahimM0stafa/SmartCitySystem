package com.example.DXC.controller;
import com.example.DXC.dto.UserProfileResponse;
import com.example.DXC.model.UserDetailsImpl;
import com.example.DXC.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        try {
            // Get the authenticated user's details
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            // Get profile by the authenticated user's ID
            UserProfileResponse profile = userService.getProfile(userDetails.getUser().getId());

            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}
