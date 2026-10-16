
package com.example.demo.repository;

import com.example.demo.controller.Todo;
import com.example.demo.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    // Find tasks belonging to a particular user
    List<Todo> findByUser(User user);

    // Find a task only when it belongs to the specified user
    Optional<Todo> findByIdAndUser(Long id, User user);
}
