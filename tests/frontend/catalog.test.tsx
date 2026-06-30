import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductCatalog } from "../../frontend/src/App.js";
import { Categoria, Produto } from "../../frontend/src/api.js";

const categorias: Categoria[] = [
  { id: 1, nome: "Eletronicos", descricao: "Dispositivos" },
  { id: 2, nome: "Livros", descricao: "Livros tecnicos" }
];

const produtos: Produto[] = [
  {
    id: 1,
    nome: "Teclado mecanico",
    descricao: "ABNT2",
    imagemUrl: "",
    preco: 250,
    quantidadeEstoque: 10,
    ativo: true,
    categoria: categorias[0]!
  },
  {
    id: 2,
    nome: "Clean Code",
    descricao: "Boas praticas",
    imagemUrl: "",
    preco: 180,
    quantidadeEstoque: 5,
    ativo: true,
    categoria: categorias[1]!
  }
];

describe("ProductCatalog", () => {
  it("filtra produtos por busca e categoria", () => {
    render(<ProductCatalog categorias={categorias} produtos={produtos} onAdd={vi.fn()} />);

    expect(screen.getByText("Teclado mecanico")).toBeInTheDocument();
    expect(screen.getByText("Clean Code")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Buscar por nome"), { target: { value: "clean" } });

    expect(screen.queryByText("Teclado mecanico")).not.toBeInTheDocument();
    expect(screen.getByText("Clean Code")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });

    expect(screen.queryByText("Clean Code")).not.toBeInTheDocument();
  });
});
