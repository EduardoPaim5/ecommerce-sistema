package com.example.ecommerce.config;

import com.example.ecommerce.entity.Carrinho;
import com.example.ecommerce.entity.Categoria;
import com.example.ecommerce.entity.PapelUsuario;
import com.example.ecommerce.entity.Produto;
import com.example.ecommerce.entity.Usuario;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.CategoryRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class InitialDataConfig implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Seed Categories
            Categoria eletronicos = Categoria.builder().nome("Eletrônicos").descricao("Dispositivos e acessorios eletronicos").build();
            Categoria livros = Categoria.builder().nome("Livros").descricao("Livros fisicos e digitais").build();
            Categoria vestuario = Categoria.builder().nome("Vestuário").descricao("Roupas e calcados masculinos e femininos").build();

            eletronicos = categoryRepository.save(eletronicos);
            livros = categoryRepository.save(livros);
            vestuario = categoryRepository.save(vestuario);

            // Seed Users
            Usuario admin = Usuario.builder()
                    .nome("Administrador")
                    .email("admin@loja.com")
                    .senhaHash(passwordEncoder.encode("admin123"))
                    .papel(PapelUsuario.ADMIN)
                    .build();
            
            Usuario cliente = Usuario.builder()
                    .nome("João da Silva")
                    .email("cliente@loja.com")
                    .senhaHash(passwordEncoder.encode("cliente123"))
                    .papel(PapelUsuario.CLIENTE)
                    .build();

            admin = userRepository.save(admin);
            cliente = userRepository.save(cliente);

            // Create carts for users
            Carrinho cartAdmin = Carrinho.builder().usuarioId(admin.getId()).jsonAtualizadoEm(LocalDateTime.now()).build();
            Carrinho cartCliente = Carrinho.builder().usuarioId(cliente.getId()).jsonAtualizadoEm(LocalDateTime.now()).build();
            cartRepository.save(cartAdmin);
            cartRepository.save(cartCliente);

            // Seed Products
            Produto smartphone = Produto.builder()
                    .nome("Smartphone Quantum X")
                    .descricao("Smartphone potente com 128GB de armazenamento, tela de 6.5 polegadas e camera tripla.")
                    .preco(new BigDecimal("1899.90"))
                    .quantidadeEstoque(15)
                    .ativo(true)
                    .categoria(eletronicos)
                    .imagemUrl("https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=60")
                    .build();

            Produto notebook = Produto.builder()
                    .nome("Notebook UltraBook Pro")
                    .descricao("Processador Intel i7 de ultima geracao, 16GB RAM, SSD 512GB e placa grafica dedicada.")
                    .preco(new BigDecimal("4999.00"))
                    .quantidadeEstoque(5)
                    .ativo(true)
                    .categoria(eletronicos)
                    .imagemUrl("https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=500&auto=format&fit=crop&q=60")
                    .build();

            Produto livroFisica = Produto.builder()
                    .nome("O Universo em uma Casca de Noz")
                    .descricao("Livro fantastico do renomado astrofisico Stephen Hawking explicando os misterios do cosmos.")
                    .preco(new BigDecimal("59.90"))
                    .quantidadeEstoque(30)
                    .ativo(true)
                    .categoria(livros)
                    .imagemUrl("https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60")
                    .build();

            Produto camiseta = Produto.builder()
                    .nome("Camiseta Algodão Egípcio")
                    .descricao("Camiseta preta basica, fabricada com 100% algodao egipcio, conforto extremo e alta durabilidade.")
                    .preco(new BigDecimal("89.90"))
                    .quantidadeEstoque(50)
                    .ativo(true)
                    .categoria(vestuario)
                    .imagemUrl("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60")
                    .build();

            Produto produtoEsgotado = Produto.builder()
                    .nome("Fone de Ouvido Bluetooth SoundMax")
                    .descricao("Fone de ouvido com cancelamento ativo de ruido, bateria de 40h de duracao.")
                    .preco(new BigDecimal("349.90"))
                    .quantidadeEstoque(0) // Out of stock product for testing
                    .ativo(true)
                    .categoria(eletronicos)
                    .imagemUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60")
                    .build();

            Produto produtoInativo = Produto.builder()
                    .nome("Teclado Mecânico Vintage")
                    .descricao("Teclado mecanico retro iluminado com switches azuis.")
                    .preco(new BigDecimal("299.90"))
                    .quantidadeEstoque(10)
                    .ativo(false) // Inactive product for testing
                    .categoria(eletronicos)
                    .imagemUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60")
                    .build();

            productRepository.save(smartphone);
            productRepository.save(notebook);
            productRepository.save(livroFisica);
            productRepository.save(camiseta);
            productRepository.save(produtoEsgotado);
            productRepository.save(produtoInativo);

            System.out.println(">>> Banco de dados inicializado com dados de teste!");
        }
    }
}
