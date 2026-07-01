package com.ecommerce.repository;

import com.ecommerce.domain.Carrinho;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {

    // Carrega os itens (e seus produtos) na mesma consulta para permitir a
    // serializacao fora da transacao (open-in-view = false).
    @EntityGraph(attributePaths = {"itens", "itens.produto"})
    Optional<Carrinho> findByUsuarioId(Long usuarioId);
}
