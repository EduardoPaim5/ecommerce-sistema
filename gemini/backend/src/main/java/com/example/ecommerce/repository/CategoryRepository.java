package com.example.ecommerce.repository;

import com.example.ecommerce.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Categoria, Long> {
    boolean existsByNome(String nome);
}
