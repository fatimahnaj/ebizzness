package com.ebizzness.ecommerce.repository;

import java.util.List;
import java.util.Optional;



import org.springframework.data.jpa.repository.JpaRepository;

import com.ebizzness.ecommerce.entity.User;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndRoleIn(String email, List<String> roles);
    Optional<User> findByEmailAndRole(String email, String role);
    Optional<User> findByMmuIDAndRole(String mmuID, String role);
    
}
