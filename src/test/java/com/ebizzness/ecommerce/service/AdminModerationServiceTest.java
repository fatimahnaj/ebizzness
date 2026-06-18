package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.UserRepo;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminModerationServiceTest {

    @Test
    void banUserInvalidatesActiveSessions() {
        UserRepo userRepository = mock(UserRepo.class);
        ProductRepo productRepository = mock(ProductRepo.class);
        SessionService sessionService = mock(SessionService.class);
        AdminModerationService adminModerationService = new AdminModerationService(
                userRepository,
                productRepository,
                sessionService
        );

        Seller seller = new Seller();
        when(userRepository.findById(7L)).thenReturn(Optional.of(seller));

        adminModerationService.banUser(7L);

        assertTrue(seller.isBanned());
        verify(userRepository).save(seller);
        verify(sessionService).invalidateSessionsForUser(7L);
    }
}
