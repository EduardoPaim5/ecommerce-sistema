package com.ecommerce.repository;

import com.ecommerce.domain.Produto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByAtivoTrueOrderByNomeAsc();

    List<Produto> findByAtivoTrueAndNomeContainingIgnoreCaseOrderByNomeAsc(String nome);

    List<Produto> findByAtivoTrueAndCategoriaIdOrderByNomeAsc(Long categoriaId);
}
