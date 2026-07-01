package com.example.ecommerce.repository;

import com.example.ecommerce.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByAtivoTrue();
    
    @Query("SELECT p FROM Produto p WHERE p.ativo = true AND LOWER(p.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Produto> findByAtivoTrueAndNomeContainingIgnoreCase(@Param("nome") String nome);
    
    @Query("SELECT p FROM Produto p WHERE p.ativo = true AND p.categoria.id = :categoriaId")
    List<Produto> findByAtivoTrueAndCategoriaId(@Param("categoriaId") Long categoryId);

    List<Produto> findByCategoriaId(Long categoryId);
}
