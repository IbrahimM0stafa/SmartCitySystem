package com.example.DXC.jwt;

import com.example.DXC.model.User;
import com.example.DXC.repository.UserRepository;
import com.example.DXC.service.CustomOAuth2User;
import java.io.IOException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getEmail();

        // You can fetch more user info from DB if needed
        User user = userRepository.findByEmail(email).orElseThrow();

        // Generate JWT
        String token = jwtUtils.generateJwtTokenWithEmail(email);

        // Send JWT in redirect URL or cookie (Here: redirect with token)
        String redirectURL = "http://localhost:3000/oauth2/redirect?token=" + token; // Change to your frontend URL

        getRedirectStrategy().sendRedirect(request, response, redirectURL);
    }
}

