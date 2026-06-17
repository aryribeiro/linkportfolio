# LinkPortfólio
<img width="840" height="685" alt="image" src="https://github.com/user-attachments/assets/63d42a2c-0f8b-4565-bed7-e4d83b866246" />

Aplicação web moderna para organizar e exibir seu portfólio de links, projetos, redes sociais e contatos em uma única página personalizada. Inspirado no Linktree, mas com controle total, painel administrativo e deploy gratuito na Vercel.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06b6d4?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)

---

## Funcionalidades

**Página Pública**
- Perfil com foto, nome e bio
- Links agrupados por categorias em grid responsivo (1/2/3 colunas)
- Dark mode com toggle e persistência
- Busca instantânea de links (sem reload)
- Animações suaves (Framer Motion)
- Botão de compartilhamento (Web Share API + fallback clipboard)
- Footer com data/hora em tempo real (pt-BR)
- PWA-ready (manifest.json)

**Painel Administrativo**
- Protegido por senha (bcrypt + JWT)
- CRUD completo de links com upload de ícone (base64, 64x64px)
- Drag & drop para reordenar links
- Edição de perfil (nome, descrição, foto 300x300px)
- Gerador de QR Code da página
- Preview do site público

**Arquitetura & Segurança**
- Cache em memória com TTL + stale-while-revalidate
- Rate limiting na autenticação (5 tentativas/min)
- Validação com Zod em todas as API routes
- Headers de segurança (HSTS, CSP, X-Frame-Options)
- Senha exclusivamente via variável de ambiente (nunca no código)
- Region otimizada para Brasil (GRU)

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

Crie um arquivo `links_data.json` com a estrutura:

```json
{
  "profile": {
    "name": "Seu Nome",
    "description": "Sua bio aqui",
    "image": null
  },
  "links": [
    {
      "id": 1,
      "title": "Meu Projeto",
      "url": "https://exemplo.com",
      "icon": "fa-code",
      "category": "Projetos",
      "clicks": 0
    }
  ]
}
```

Faça upload no Google Drive, defina compartilhamento como **"Qualquer pessoa com o link"** e converta o link para download direto:

```
https://drive.google.com/uc?export=download&id=SEU_FILE_ID
```

### 2. Importar no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório `aryribeiro/linkportfolio`
3. Framework: **Next.js** (detectado automaticamente)

### 3. Configurar Variáveis de Ambiente

No painel da Vercel, em **Settings → Environment Variables**, adicione:

| Variável | Valor |
|----------|-------|
| `ADMIN_PASSWORD` | Sua senha do painel admin |
| `GOOGLE_DRIVE_JSON_URL` | URL direta do JSON no Google Drive |
| `JWT_SECRET` | String aleatória com 32+ caracteres |
| `CACHE_TTL_SECONDS` | `300` (opcional, padrão 5 min) |
| `NEXT_PUBLIC_SITE_URL` | URL do seu site na Vercel |

### 4. Deploy

Clique em **Deploy**. Pronto.

---

## Uso após Deploy

### Acessar o painel admin

Navegue para `https://seu-site.vercel.app/admin/login` e entre com a senha definida em `ADMIN_PASSWORD`.

### Gerenciar links

1. Na aba **Links**, clique em **+ Novo Link**
2. Preencha título, URL e categoria
3. Para ícone: faça upload de imagem (convertida para base64) ou digite uma classe Font Awesome (`fa-github`, `fa-youtube`, etc.)
4. Arraste para reordenar
5. Clique em **Salvar Ordem**

### Editar perfil

1. Na aba **Perfil**, altere nome e descrição
2. Faça upload da foto (recortada automaticamente para 300x300px)
3. Clique em **Salvar Perfil**

### Compartilhar

- Use o botão de share no canto superior direito da página pública
- Ou acesse a aba **QR Code** no admin para gerar/imprimir o QR

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
│   ├── page.tsx                 → Página pública
│   ├── admin/
│   │   ├── login/page.tsx       → Login admin
│   │   └── page.tsx             → Dashboard admin
│   └── api/
│       ├── auth/route.ts        → Autenticação
│       ├── links/route.ts       → CRUD links
│       ├── links/click/route.ts → Analytics de cliques
│       ├── profile/route.ts     → Atualizar perfil
│       └── revalidate/route.ts  → Limpar cache
├── components/                  → Componentes React
├── lib/
│   ├── auth.ts                  → bcrypt + JWT
│   ├── cache.ts                 → Cache em memória (TTL)
│   ├── db.ts                    → Fetch Google Drive
│   └── types.ts                 → Interfaces TypeScript
├── public/icones/               → Ícones estáticos
├── middleware.ts                → Proteção de rotas /admin
└── vercel.json                  → Config de deploy (região GRU)
```

---

## Ícones Suportados

| Formato | Exemplo | Comportamento |
|---------|---------|--------------|
| Font Awesome | `fa-github` | Renderiza como `<i class="fas fa-github">` |
| Base64 (upload) | `data:image/png;base64,...` | Renderiza como `<img>` 64x64px |
| URL externa | `https://...icon.png` | Renderiza como `<img>` (compatibilidade) |

---

## Autor

**Ary Ribeiro** — [aryribeiro@gmail.com](mailto:aryribeiro@gmail.com)
