package com.ecommerce.config;

import com.ecommerce.domain.Categoria;
import com.ecommerce.domain.EncoderSenha;
import com.ecommerce.domain.PapelUsuario;
import com.ecommerce.domain.Produto;
import com.ecommerce.domain.Usuario;
import com.ecommerce.repository.CarrinhoRepository;
import com.ecommerce.repository.CategoriaRepository;
import com.ecommerce.repository.ProdutoRepository;
import com.ecommerce.repository.UsuarioRepository;
import com.ecommerce.domain.Carrinho;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Popula o banco com dados de exemplo na primeira execucao (usuarios, categorias
 * e produtos), para facilitar a demonstracao do sistema.
 *
 * <p>Credenciais criadas:
 * <ul>
 *   <li>Admin: {@code admin@loja.com} / {@code admin123}</li>
 *   <li>Cliente: {@code cliente@loja.com} / {@code cliente123}</li>
 * </ul>
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CarrinhoRepository carrinhoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;
    private final EncoderSenha encoderSenha;

    public DataSeeder(UsuarioRepository usuarioRepository,
                      CarrinhoRepository carrinhoRepository,
                      CategoriaRepository categoriaRepository,
                      ProdutoRepository produtoRepository,
                      EncoderSenha encoderSenha) {
        this.usuarioRepository = usuarioRepository;
        this.carrinhoRepository = carrinhoRepository;
        this.categoriaRepository = categoriaRepository;
        this.produtoRepository = produtoRepository;
        this.encoderSenha = encoderSenha;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        criarUsuario("Administrador", "admin@loja.com", "admin123", PapelUsuario.ADMIN);
        criarUsuario("Cliente Demonstracao", "cliente@loja.com", "cliente123", PapelUsuario.CLIENTE);

        Categoria eletronicos = categoriaRepository.save(
                new Categoria("Eletronicos", "Aparelhos eletronicos e gadgets"));
        Categoria livros = categoriaRepository.save(
                new Categoria("Livros", "Livros fisicos de diversos generos"));
        Categoria acessorios = categoriaRepository.save(
                new Categoria("Acessorios", "Acessorios e perifericos"));

        produtoRepository.save(new Produto("Fone de Ouvido Bluetooth",
                "Fone sem fio com cancelamento de ruido e 30h de bateria.",
                "https://picsum.photos/seed/fone/400/300",
                new BigDecimal("249.90"), 25, eletronicos));
        produtoRepository.save(new Produto("Teclado Mecanico",
                "Teclado mecanico ABNT2 com switches azuis e iluminacao RGB.",
                "https://picsum.photos/seed/teclado/400/300",
                new BigDecimal("389.00"), 12, acessorios));
        produtoRepository.save(new Produto("Mouse Gamer",
                "Mouse optico 16000 DPI com 7 botoes programaveis.",
                "https://picsum.photos/seed/mouse/400/300",
                new BigDecimal("159.90"), 0, acessorios));
        produtoRepository.save(new Produto("Smartphone X",
                "Smartphone 128GB, tela AMOLED 6.5 e camera tripla.",
                "https://picsum.photos/seed/phone/400/300",
                new BigDecimal("2199.00"), 8, eletronicos));
        produtoRepository.save(new Produto("Clean Code",
                "Livro sobre boas praticas de codigo, por Robert C. Martin.",
                "https://picsum.photos/seed/cleancode/400/300",
                new BigDecimal("119.90"), 40, livros));
        produtoRepository.save(new Produto("Engenharia de Software Moderna",
                "Livro sobre praticas modernas de engenharia de software.",
                "https://picsum.photos/seed/eng/400/300",
                new BigDecimal("99.90"), 30, livros));
    }

    private void criarUsuario(String nome, String email, String senha, PapelUsuario papel) {
        Usuario usuario = usuarioRepository.save(
                new Usuario(nome, email, encoderSenha.codificar(senha), papel));
        carrinhoRepository.save(new Carrinho(usuario.getId()));
    }
}
