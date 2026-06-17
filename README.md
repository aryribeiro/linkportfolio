# LinkPortfólio

Aplicação web moderna para organizar e exibir seu portfólio de links, projetos, redes sociais e contatos em uma única página personalizada. Inspirado no Linktree, mas com controle total, painel administrativo e deploy gratuito na Vercel.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06b6d4?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)

---

## Funcionalidades

**Página Pública**
- Perfil com foto, nome (destaque azul marinho) e bio
- Links agrupados por categorias em grid responsivo (2 colunas)
- Ícones e textos centralizados nos cards, com quebra de linha automática
- Dark mode com toggle (sol/lua) e persistência
- Campo de busca compacto (30%, alinhado à direita)
- Animações suaves (Framer Motion)
- Botão de compartilhamento (Web Share API + fallback clipboard)
- Borda azul marinho escuro ao redor do conteúdo com cantos arredondados
- Footer fixo com data/hora em tempo real (pt-BR) + IP público do visitante
- Barra de rolagem estilizada em azul marinho (todos os navegadores)
- Barra de status mobile em azul marinho escuro
- Acesso ao painel admin via ícone de engrenagem (⚙) no canto superior direito
- PWA-ready (manifest.json)

**Painel Administrativo**
- Captcha matemático no login (soma, subtração, multiplicação)
- Protegido por senha (bcrypt + JWT)
- Rate limiting na autenticação (5 tentativas/min)
- CRUD completo de links com menu suspenso de ícones:
  - Emojis: Hiperlink (🔗), Livro ou E-book (📖), E-mail (📧), Globo (🌐), Vídeo (🎬), Código (💻), Educação (🎓)
  - Ícones locais do repositório (`/public/icones/`)
  - Ícones customizados via JSON (URLs externas)
- Dropdown de categorias: Aplicativos & Projetos, Redes Sociais e Sites, Contato, Videoaulas e Hands on AWS, Educação, Currículo, Outros (+ customizáveis via JSON)
- Drag & drop para reordenar links (persistência garantida no cache)
- Seletor de foto de perfil da pasta `/public/foto/`
- Botão **⬇ Download JSON** (exporta config para backup/Google Drive)
- Botão **⟳ Reload Drive** (força recarregamento do JSON do Google Drive)
- Gerador de QR Code da página
- Visualização do site público

**Arquitetura & Segurança**
- Cache em memória com TTL + stale-while-revalidate + pin (edições admin não expiram)
- Validação com Zod em todas as API routes
- Headers de segurança (HSTS, X-Frame-Options, X-Content-Type-Options)
- Senha exclusivamente via variável de ambiente (nunca no código ou JSON)
- Region otimizada para Brasil (GRU - São Paulo)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript (strict) |
| Estilo | Tailwind CSS 3.4 |
| Animações | Framer Motion |
| Drag & Drop | dnd-kit |
| QR Code | qrcode (canvas) |
| Auth | bcryptjs + jsonwebtoken |
| Validação | Zod |
| Dados | Google Drive JSON + in-memory cache |
| Deploy | Vercel |

---

## Deploy na Vercel (Passo a Passo)

### 1. Preparar o JSON de dados

Crie um arquivo `links_data.json` com a seguinte estrutura:

```json
{
  "profile": {
    "name": "Seu Nome",
    "description": "Sua bio aqui",
    "photo": "/foto/foto_perfil.jpg"
  },
  "categories": [
    "Aplicativos & Projetos",
    "Redes Sociais e Sites",
    "Contato",
    "Currículo"
  ],
  "links": [
    {
      "id": 1747415094744,
      "title": "Meu Projeto",
      "url": "https://exemplo.com",
      "icon": "/icones/appicon.png",
      "category": "Aplicativos & Projetos"
    }
  ]
}
```

**Campos importantes:**
- `profile.photo` — caminho para a foto na pasta `/public/foto/` do repositório
- `categories` — lista de categorias que aparecerão no dropdown do admin
- `links[].icon` — caminho para ícone em `/public/icones/`, emoji, ou URL externa

**Upload para Google Drive:**
1. Faça upload do `links_data.json` no Google Drive
2. Clique com botão direito → Compartilhar → **"Qualquer pessoa com o link"**
3. Copie o ID do arquivo da URL (entre `/d/` e `/view`)
4. Monte o link direto: `https://drive.google.com/uc?export=download&id=SEU_FILE_ID`

### 2. Preparar o Repositório

1. Faça fork ou clone deste repositório
2. Coloque sua(s) foto(s) de perfil em `public/foto/`
3. Coloque ícones personalizados (PNG, fundo transparente) em `public/icones/`
4. Faça commit e push

### 3. Importar no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe seu repositório
3. Framework: **Next.js** (detectado automaticamente)

### 4. Configurar Variáveis de Ambiente

No painel da Vercel, em **Settings → Environment Variables**, adicione:

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `ADMIN_PASSWORD` | Sim | Senha do painel admin (texto puro, hash gerado em runtime) |
| `GOOGLE_DRIVE_JSON_URL` | Sim | URL direta do JSON no Google Drive |
| `JWT_SECRET` | Sim | String aleatória com 32+ caracteres |
| `CACHE_TTL_SECONDS` | Não | Tempo do cache em segundos (padrão: 300 = 5 min) |
| `NEXT_PUBLIC_SITE_URL` | Não | URL pública do site (para QR Code) |

**Gerar JWT_SECRET pelo terminal:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 5. Deploy

Clique em **Deploy**. Pronto.

---

## Uso após Deploy

### Acessar o painel admin

Clique no ícone de **engrenagem** (⚙) no canto superior direito da página pública. Resolva o **captcha matemático** e digite a senha definida em `ADMIN_PASSWORD`.

### Gerenciar links

1. Na aba **Links**, clique em **+ Novo Link**
2. Preencha título e URL
3. Selecione a **categoria** no dropdown
4. Selecione o **ícone** no menu suspenso (emojis, ícones locais ou do JSON)
5. Arraste os itens para **reordenar**
6. Clique em **Salvar Ordem**

### Editar perfil

1. Na aba **Perfil**, selecione a foto no dropdown (vem da pasta `public/foto/`)
2. Altere nome e descrição
3. Clique em **Salvar Perfil**

### Exportar / Backup

- Clique em **⬇ Download JSON** para baixar todas as configurações atuais
- Faça upload desse arquivo no Google Drive para persistir as alterações permanentemente

### Recarregar dados do Google Drive

- Clique em **⟳ Reload Drive** para forçar o recarregamento do JSON (útil após editar o arquivo diretamente no Drive)

### Compartilhar

- Use o botão de share (ícone de rede) no canto superior direito da página pública
- Ou acesse a aba **QR Code** no admin para gerar/imprimir

---

## Personalização de Ícones

### Ícones no repositório

Coloque imagens PNG (fundo transparente recomendado) na pasta `public/icones/`. Os ícones disponíveis atualmente:

| Arquivo | Uso |
|---------|-----|
| `appicon.png` | Aplicativos em geral |
| `dnicon.png` | Direto Notícias |
| `githubicon.png` | GitHub |
| `gmailicon.png` | Gmail |
| `instagramicon.png` | Instagram |
| `linkedinicon.png` | LinkedIn |
| `whatsicon.png` | WhatsApp |
| `youtubeicon.png` | YouTube |
| `credly.png` | Credly |

### Ícones via JSON (sem alterar código)

Adicione ao seu `links_data.json`:

```json
{
  "customIcons": [
    { "name": "Meu App", "url": "https://exemplo.com/icone.png" },
    { "name": "Outro Serviço", "url": "https://exemplo.com/outro.png" }
  ]
}
```

Esses ícones aparecerão na seção **"Meus Ícones (JSON)"** do menu suspenso.

---

## Desenvolvimento Local

```bash
# Clonar
git clone https://github.com/aryribeiro/linkportfolio.git
cd linkportfolio

# Instalar dependências
npm install

# Configurar variáveis (copie e edite)
cp .env.example .env

# Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

---

## Estrutura do Projeto

```
├── app/
│   ├── page.tsx                 → Página pública (borda azul, grid 2 colunas)
│   ├── layout.tsx               → Layout raiz (fonts, meta, theme-color)
│   ├── globals.css              → Tailwind + CSS variables + scrollbar
│   ├── admin/
│   │   ├── login/page.tsx       → Login admin (captcha + senha)
│   │   └── page.tsx             → Dashboard admin (Links, Perfil, QR)
│   └── api/
│       ├── auth/route.ts        → Autenticação (bcrypt + JWT + rate limit)
│       ├── links/route.ts       → GET/PUT links (cache pinned)
│       ├── links/click/route.ts → Analytics de cliques
│       ├── profile/route.ts     → PUT perfil (cache pinned)
│       └── revalidate/route.ts  → Invalidar cache (usado pelo Reload Drive)
├── components/
│   ├── ProfileCard.tsx          → Foto + nome (azul marinho) + bio
│   ├── LinkCard.tsx             → Card centralizado com quebra de linha
│   ├── CategorySection.tsx      → Seção por categoria (grid 2 colunas)
│   ├── IconRenderer.tsx         → Renderiza emoji / path / URL / FA
│   ├── SearchBar.tsx            → Busca compacta (30%, alinhada à direita)
│   ├── Footer.tsx               → Clock + IP + descrição (fixo)
│   ├── ThemeProvider.tsx        → Context dark mode
│   ├── ThemeToggle.tsx          → Botão sol/lua
│   ├── ShareButton.tsx          → Web Share API
│   ├── QRCode.tsx               → Canvas QR
│   ├── AdminButton.tsx          → Engrenagem (⚙) no canto superior direito
│   └── admin/
│       ├── AdminLinks.tsx       → CRUD + DnD + icon picker + category dropdown
│       ├── AdminProfile.tsx     → Editor de perfil + photo picker
│       └── AdminQRCode.tsx      → Gerador de QR
├── lib/
│   ├── auth.ts                  → bcrypt + JWT
│   ├── cache.ts                 → Cache em memória (TTL + stale + pin)
│   ├── db.ts                    → Fetch Google Drive + cache
│   └── types.ts                 → Interfaces TypeScript
├── public/
│   ├── foto/                    → Fotos de perfil
│   ├── icones/                  → Ícones dos links (PNG, fundo transparente)
│   └── manifest.json            → PWA manifest
├── middleware.ts                → Proteção de rotas /admin
├── vercel.json                  → Deploy config (região GRU, headers)
└── links_data.json              → Dados de exemplo (upload pro Google Drive)
```

---

## Ícones Suportados

| Formato | Exemplo | Comportamento |
|---------|---------|--------------|
| Caminho local | `/icones/appicon.png` | Renderiza como `<img>` do repositório |
| Emoji | `🔗`, `📖`, `🌐` | Renderiza como texto (emoji nativo) |
| URL externa | `https://...icon.png` | Renderiza como `<img>` (compatibilidade) |
| Font Awesome | `fa-github` | Renderiza como `<i class="fas fa-github">` |

---

## Autor

**Ary Ribeiro** — [aryribeiro@gmail.com](mailto:aryribeiro@gmail.com)
