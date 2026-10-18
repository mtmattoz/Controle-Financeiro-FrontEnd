# Integração com a API — inventário de endpoints

Inventário montado a partir da leitura dos arquivos reais do backend
[`mtmattoz/controle-financeiro-backend`](https://github.com/mtmattoz/Controle-Financeiro-Backend):
controllers, entidades, DTOs, services, repositories, `CorsConfig` e `GlobalExceptionHandler`.

- **URL base:** `VITE_API_URL` (padrão `http://localhost:8080`)
- **CORS:** o backend libera apenas a origem `http://localhost:5173` (métodos GET, POST, PUT, DELETE, OPTIONS).
  Por isso o Vite está configurado com `port: 5173` e `strictPort: true`.
- **Identificação do usuário:** não há token. O `usuarioId` vai na URL de cada rota (ver [Segurança](#segurança-e-autenticação)).

## Formatos de erro do backend

| Origem | Status | Corpo | Como o front trata |
|---|---|---|---|
| `SenhaIncorretaException` | 401 | texto: `Senha incorreta.` | mostra a mensagem do servidor |
| `UsuarioNaoEncontradoException` | 404 | texto: `Usuário não encontrado.` | mostra a mensagem do servidor |
| `AcessoNegadoException` | 403 | texto, ex.: `Você não pode excluir uma categoria de outro usuário.` | mostra a mensagem do servidor |
| `MethodArgumentNotValidException` (`@Valid`) | 400 | objeto `{ "campo": "mensagem" }` | mensagem ao lado do campo correspondente |
| Qualquer `RuntimeException` sem handler | 500 | padrão do Spring `{ timestamp, status, error, path }`, sem a mensagem original | mensagem de contexto da tela (ex.: "nome de usuário provavelmente já está em uso") |
| API fora do ar | — | — | aviso "Sem conexão com a API" com botão de tentar novamente |

A normalização fica em `src/services/api.js` (`ApiError` + `mensagemDeErro`).

---

## 1. Endpoints confirmados e integrados

Todos estes estão ligados a uma funcionalidade real da interface.

### Usuários / autenticação — `UsuarioController` (`/usuario`)

| Método | Rota | Parâmetros | Corpo | Resposta | Tela | Serviço |
|---|---|---|---|---|---|---|
| POST | `/usuario/cadastrar` | — | `{ "nomeUsuario": string (obrigatório, ≤50, único), "senha": string (≥6) }` | 200 `{ id, nomeUsuario, criadoEm }` · 400 campos · 500 nome repetido | Cadastro | `authService.cadastrar` |
| POST | `/usuario/login` | `@RequestParam nomeUsuario`, `@RequestParam senha` (enviados como `application/x-www-form-urlencoded`, fora da URL) | — | 200 `{ id, nomeUsuario, criadoEm }` · 404 · 401 | Login (e após o cadastro) | `authService.login` |

### Categorias — `CategoriaController` (`/categoria`)

Entidade no JSON: `{ id, nome, criadoEm }` (`usuario` é `@JsonIgnore`).

| Método | Rota | Corpo | Resposta | Tela | Serviço |
|---|---|---|---|---|---|
| GET | `/categoria/usuario/{usuarioId}` | — | 200 `Categoria[]` | Categorias, formulário de transação, filtro de Transações, Assistente, teste de conexão | `categoriaService.listar` |
| POST | `/categoria/cadastrar/{usuarioId}` | `{ "nome": string (obrigatório, ≤50) }` | 200 `Categoria` · 400 | Categorias; botão "Criar categoria" no Assistente | `categoriaService.cadastrar` |
| DELETE | `/categoria/{id}/usuario/{usuarioId}` | — | 204 · 403 · 500 se houver transações vinculadas (FK) | Categorias | `categoriaService.excluir` |

### Transações — `TransacaoController` (`/transacao`)

Entidade no JSON: `{ id, descricao, valor, tipo: "ENTRADA"|"SAIDA", data: "AAAA-MM-DD", categoria: { id, nome, criadoEm }, criadoEm }`.

| Método | Rota | Corpo | Resposta | Tela | Serviço |
|---|---|---|---|---|---|
| GET | `/transacao/usuario/{usuarioId}` | — | 200 `Transacao[]` | Transações, Dashboard (gráficos e recentes), Categorias (estatísticas de uso) | `transacaoService.listar` |
| GET | `/transacao/usuario/{usuarioId}/categoria/{categoriaId}` | — | 200 `Transacao[]` | Transações (filtro de categoria) | `transacaoService.listarPorCategoria` |
| GET | `/transacao/usuario/{usuarioId}/tipo/{tipo}` | — | 200 `Transacao[]` | Transações (filtro Entradas/Saídas) | `transacaoService.listarPorTipo` |
| POST | `/transacao/cadastrar/{usuarioId}/{categoriaId}` | `{ "descricao": string (≤150), "valor": number > 0, "tipo": "ENTRADA"\|"SAIDA", "data": "AAAA-MM-DD" }`. Usuário e categoria vão **na URL**, não no corpo | 200 `Transacao` · 400 · 500 (categoria/usuário inexistente) | Modal "Nova movimentação" (Despesa/Entrada), confirmação do Assistente | `transacaoService.cadastrar` |
| DELETE | `/transacao/{id}/usuario/{usuarioId}` | — | 204 · 403 · 500 | Transações | `transacaoService.excluir` |

### Receitas — `ReceitaController` (`/receita`)

Entidade no JSON: `{ id, descricao, valor, data, criadoEm }`. **Não tem categoria nem tipo**, diferente de Transação.

| Método | Rota | Corpo | Resposta | Tela | Serviço |
|---|---|---|---|---|---|
| GET | `/receita/usuario/{usuarioId}` | — | 200 `Receita[]` | Receitas, Dashboard, Relatórios (receitas do mês) | `receitaService.listar` |
| POST | `/receita/cadastrar/{usuarioId}` | `{ "descricao": string (≤100), "valor": number > 0, "data": "AAAA-MM-DD" }` | 200 `Receita` · 400 | Modal "Nova movimentação" (aba Receita) | `receitaService.cadastrar` |
| DELETE | `/receita/{id}/usuario/{usuarioId}` | — | 204 · 403 · 500 | Receitas | `receitaService.excluir` |

### Relatórios — `RelatorioController` (`/relatorio`)

Significado conferido no `RelatorioService`:

| Método | Rota | Parâmetros | Resposta | Significado real | Tela | Serviço |
|---|---|---|---|---|---|---|
| GET | `/relatorio/usuario/{usuarioId}` | — | `{ entradas, saidas, saldo }` | `entradas` = **todas as receitas + transações ENTRADA**; `saidas` = transações SAIDA; `saldo` = diferença. Todo o período | Dashboard (indicadores), Relatórios (bloco "Acumulado") | `relatorioService.resumo` |
| GET | `/relatorio/usuario/{usuarioId}/mes` | query `mes` (1–12), `ano` | `Transacao[]` | Apenas **transações** do mês (receitas não entram) | Dashboard (resultado do mês), Relatórios (mensal) | `relatorioService.transacoesDoMes` |
| GET | `/relatorio/usuario/{usuarioId}/categorias` | — | `{ "NomeCategoria": valor }` | Soma das transações **SAIDA** por nome de categoria, todo o período | Dashboard e Relatórios (gráfico de rosca "Despesas por categoria") | `relatorioService.despesasPorCategoria` |

### Assistente IA — `AssistenteFinanceiroController` (`/assistente`)

| Método | Rota | Corpo | Resposta | Tela | Serviço |
|---|---|---|---|---|---|
| POST | `/assistente/interpretar` | `{ "mensagem": string }` | 200 `{ tipo, valor, descricao, categoria, data }` · 500 quando a IA não entende ou o Gemini falha | Assistente | `assistenteService.interpretar` |

**Não grava nada.** O campo `categoria` é um *nome* sugerido pela IA, não um id. Fluxo implementado:

1. `POST /assistente/interpretar` → card de confirmação editável.
2. O front procura uma categoria do usuário com o mesmo nome (sem diferenciar acentos/maiúsculas) e a pré-seleciona.
   Se não existir, avisa e oferece um botão explícito "Criar categoria" (`POST /categoria/cadastrar/{usuarioId}`).
3. Só no clique em **Confirmar movimentação**:
   recarrega `GET /categoria/usuario/{usuarioId}` para confirmar que a categoria existe e é do usuário →
   `POST /transacao/cadastrar/{usuarioId}/{categoriaId}` com `{ descricao, valor, tipo, data }`.
4. Sucesso só depois da resposta do servidor; dashboard, transações e relatórios são recarregados.

---

## 2. Endpoints existentes, mas não integrados

Nenhum. Todas as rotas expostas pelos controllers estão em uso.

> Observação: os repositories têm consultas que **não** são expostas por nenhum controller
> (`ReceitaRepository.findByUsuarioAndDataBetween`, `TransacaoRepository.findByUsuarioAndTipoAndCategoria`).
> Como não há rota HTTP para elas, o front não as chama. Ver sugestões na seção 3.

## 3. Operações desejadas sem suporte no backend

| Operação | Situação no front | Sugestão para o backend |
|---|---|---|
| Editar transação, receita ou categoria (PUT) | Ação omitida; aviso na tela ("exclua e registre novamente") | `PUT /{recurso}/{id}/usuario/{usuarioId}` |
| Consulta individual (GET por id) | Não necessária na interface atual | — |
| Consultar, editar ou excluir usuário | Perfil mostra os dados retornados no login; edição omitida | `GET/PUT/DELETE /usuario/{id}` |
| Receitas do mês | Filtradas no navegador a partir de `GET /receita/usuario/{id}` | Expor `findByUsuarioAndDataBetween` em `GET /receita/usuario/{id}/mes` |
| Filtro tipo + categoria juntos | Usa a rota de categoria e filtra o tipo localmente | Expor `findByUsuarioAndTipoAndCategoria` |
| Busca por descrição / intervalo de datas em transações | Filtro local sobre a lista real | Query params opcionais na listagem |
| Paginação | Não implementada (a API devolve a lista inteira) | `Pageable` nas listagens |
| Exportação | CSV gerado no navegador com os dados reais do mês | — |
| Logout / sessão no servidor | Logout apenas limpa os dados locais | Ver Segurança |

## 4. Contratos que precisam de confirmação

Os contratos acima foram lidos no código-fonte. Pontos que dependem da execução real do backend
(Spring Boot 4.1 + Jackson) e devem ser conferidos na primeira execução local:

| Ponto | O que o front espera | Proteção já implementada |
|---|---|---|
| Serialização de `LocalDate` / `LocalDateTime` | Texto ISO (`"2026-10-17"`, `"2026-10-18T12:00:00"`) | `paraDataISO` também aceita o formato de array `[2026, 10, 17]` |
| `BigDecimal` | Número JSON (`120.5`) | `paraNumero` também aceita string |
| Corpo do erro 500 | Padrão do Spring, sem `message` | Mensagens de contexto por tela; se `message` vier preenchida, ela é exibida |
| Erros do Gemini / IA sem entender | 500 genérico | Mensagem orientando a reformular a frase |

## Segurança e autenticação

O backend tem apenas `BCryptPasswordEncoder` (sem Spring Security nas rotas). O login confere a senha, mas
**não emite token nem sessão**, e as demais rotas confiam no `usuarioId` da URL. Consequências:

- Qualquer cliente que saiba um `usuarioId` consegue ler e gravar dados desse usuário.
- O front guarda no `localStorage` apenas `{ id, nomeUsuario, criadoEm }` (nunca a senha) para saber de quem são os dados exibidos.
  **Isso não é autenticação segura**, e a tela de Configurações informa isso ao usuário.
- Recomendação: Spring Security + JWT, com o usuário obtido do token em vez da URL.
  Quando isso existir, basta adicionar o header `Authorization` em `src/services/api.js`.

Outros pontos de integridade observados:

- `POST /transacao/cadastrar/{usuarioId}/{categoriaId}` não verifica se a categoria pertence ao usuário.
  O front compensa oferecendo apenas as categorias do próprio usuário e revalidando a lista antes de salvar pelo Assistente.
- `AssistenteFinanceiroController` tem `@CrossOrigin` próprio, redundante com o `CorsConfig` global (sem efeito no front).
