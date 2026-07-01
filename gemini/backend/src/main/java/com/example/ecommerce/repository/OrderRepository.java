package com.example.ecommerce.repository;

import com.example.ecommerce.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioIdOrderByDataCriacaoDesc(Long usuarioId);
}
