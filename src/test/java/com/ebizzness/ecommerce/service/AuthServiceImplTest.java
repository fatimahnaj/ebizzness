package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.request.LoginRequest;
import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.factory.BuyerFactory;
import com.ebizzness.ecommerce.factory.SellerFactory;
import com.ebizzness.ecommerce.mapper.UserMapper;
import com.ebizzness.ecommerce.repository.UserRepo;
import com.ebizzness.ecommerce.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceImplTest {

    @Test
    void loginRejectsBannedUserBeforeCreatingSession() {
        UserRepo userRepo = mock(UserRepo.class);
        UserMapper userMapper = mock(UserMapper.class);
        BuyerFactory buyerFactory = mock(BuyerFactory.class);
        SellerFactory sellerFactory = mock(SellerFactory.class);
        SessionService sessionService = mock(SessionService.class);
        AuthServiceImpl authService = new AuthServiceImpl(
                userRepo,
                userMapper,
                buyerFactory,
                sellerFactory,
                sessionService
        );

        String email = "banned@student.mmu.edu.my";
        Buyer bannedBuyer = new Buyer();
        bannedBuyer.setEmail(email);
        bannedBuyer.setPassword("secret");
        bannedBuyer.setRole("BUYER");
        bannedBuyer.setBanned(true);

        when(userRepo.findByEmailAndRoleIn(eq(email), anyList()))
                .thenReturn(Optional.of(bannedBuyer));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.login(new LoginRequest(email, "secret"))
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(sessionService, never()).createSession(bannedBuyer);
    }
}
