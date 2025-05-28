package com.example.DXC.service;

import com.example.DXC.model.User;
import com.example.DXC.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User user = super.loadUser(userRequest);

        String email = user.getAttribute("email");
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFirstName(user.getAttribute("given_name"));
            newUser.setLastName(user.getAttribute("family_name"));
            newUser.setAuthProvider("GOOGLE");

            // Create a default password for the user and hash it
            String defaultPassword = "google-auth-password";
            String hashedPassword = passwordEncoder.encode(defaultPassword);
            newUser.setPassword(hashedPassword);

            userRepository.save(newUser);
        }

        return new CustomOAuth2User(user);
    }
}
