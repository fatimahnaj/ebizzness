package com.ebizzness.ecommerce.service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.ebizzness.ecommerce.entity.User;

@Component
public class SessionService {

    private final Map<String, SessionInfo> sessions = new ConcurrentHashMap<>();

    public String createSession(User user) {
        String token = UUID.randomUUID().toString();
        sessions.put(token, new SessionInfo(user.getUserID(), determineInitialActiveRole(user)));
        return token;
    }

    public SessionInfo getSession(String authorizationHeader) {
        String token = parseToken(authorizationHeader);
        return Optional.ofNullable(sessions.get(token))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token"));
    }

    public String getActiveRole(String token) {
        SessionInfo session = sessions.get(token);
        return session == null ? null : session.getActiveRole();
    }

    public void setActiveRole(String authorizationHeader, String activeRole) {
        String token = parseToken(authorizationHeader);
        SessionInfo session = sessions.get(token);
        if (session == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
        session.setActiveRole(activeRole);
        sessions.put(token, session);
    }

    public void invalidateSession(String authorizationHeader) {
        String token = parseToken(authorizationHeader);
        sessions.remove(token);
    }

    public void invalidateSessionsForUser(Long userId) {
        sessions.entrySet().removeIf(entry -> entry.getValue().getUserId().equals(userId));
    }

    private String parseToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization header is required");
        }
        if (authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7).trim();
        }
        return authorizationHeader.trim();
    }

    private String determineInitialActiveRole(User user) {
        if ("SELLER".equalsIgnoreCase(user.getRole())) {
            return "BUYER";
        }
        return user.getRole();
    }
}
