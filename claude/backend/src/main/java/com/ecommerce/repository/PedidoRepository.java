package com.ecommerce.repository;

import com.ecommerce.domain.Pedido;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Os itens sao carregados junto para permitir a serializacao fora da
    // transacao (open-in-view = false).

    @EntityGraph(attributePaths = "itens")
    List<Pedido> findByUsuarioIdOrderByDataCriacaoDesc(Long usuarioId);

    @EntityGraph(attributePaths = "itens")
    List<Pedido> findAllByOrderByDataCriacaoDesc();

    @EntityGraph(attributePaths = "itens")
    @Override
    Optional<Pedido> findById(Long id);
}
