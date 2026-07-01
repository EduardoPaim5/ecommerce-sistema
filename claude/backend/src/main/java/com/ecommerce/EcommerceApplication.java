package com.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada da aplicacao de e-commerce.
 *
 * <p>Gerada a partir dos artefatos MDE: diagrama de classes de dominio
 * ({@code diagrama-classes-ecommerce-ia.puml}), diagrama de servicos de
 * aplicacao ({@code diagrama-servicos-ecommerce-ia.puml}) e os requisitos
 * funcionais (RF01-RF25) e regras de negocio (RN01-RN05).</p>
 */
@SpringBootApplication
public class EcommerceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }
}
