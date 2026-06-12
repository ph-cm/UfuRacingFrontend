# Relatório do Projeto Frontend — UFU Racing Formula SAE

> Gerado em: 20/05/2026

---

## Estrutura de Pastas

```
formula-sae-site/
├── public/
│   └── logos/redbull.jpg
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # Componentes reutilizáveis
│   ├── context/                # Context global
│   ├── services/               # Cliente API
│   ├── types/                  # Tipos TypeScript
│   └── lib/                    # Utilitários
├── .env
├── package.json
└── next.config.ts
```

---

## Páginas (Routes)

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `src/app/page.tsx` | Home — Hero, destaques, sub-áreas técnicas, histórico de competições, sponsors marquee |
| `/sobre` | `src/app/sobre/page.tsx` | Membros agrupados por equipe, fotos, cargo, email, LinkedIn |
| `/news` | `src/app/news/page.tsx` | Grid de notícias com skeleton loader e animação staggered |
| `/news/[id]` | `src/app/news/[id]/page.tsx` | Artigo completo com imagem hero, autor, categoria, conteúdo |
| `/admin` | `src/app/admin/page.tsx` | Painel administrativo com 5 abas (Home, Notícias, Destaques, Patrocinadores, Membros) |
| `/sponsors/contact` | `src/app/sponsors/contact/page.tsx` | Formulário de captação de patrocinadores com validação |

---

## Componentes

### Navegação & Layout

| Componente | Arquivo | Função |
|-----------|---------|--------|
| **Navbar** | `components/Navbar.tsx` | Menu responsivo fixo, links internos, toggle mobile, botão "Patrocine" |
| **Footer** | `components/Footer.tsx` | Links, contato, redes sociais (Instagram, LinkedIn, YouTube) |
| **BackButton** | `components/BackButton.tsx` | Botão voltar com fallback via `router.back()` ou href |

### Seções da Home

| Componente | Arquivo | Função |
|-----------|---------|--------|
| **Hero** | `components/Hero.tsx` | Seção hero com imagem de fundo, gradiente, animações Framer Motion |
| **StatsSection** | `components/StatsSection.tsx` | 4 cards com ícones (Troféu, Wrench, Medal, Users) |
| **MissionSection** | `components/MissionSection.tsx` | Seção informativa sobre a equipe |
| **TeamGrid** | `components/TeamGrid.tsx` | Grid 3 colunas da gestão administrativa com hover zoom |

### Sponsors

| Componente | Arquivo | Função |
|-----------|---------|--------|
| **SponsorsMarquee** | `components/SponsorsMarquee.tsx` | Esteira infinita de logos com pause-on-hover e efeito grayscale |
| **SponsorsBanner** | `components/SponsorsBanner.tsx` | Variante simples de carrossel de sponsors |
| **LogoLoop** | `components/LogoLoop.tsx` | Marquee avançado com ResizeObserver, velocity suave, orientação configurável |

### Membros

| Componente | Arquivo | Função |
|-----------|---------|--------|
| **MemberCard** | `components/MemberCard.tsx` | Card 280×380px com overlay, nome, cargo, equipe e links sociais |
| **ReflectiveMemberCard** | `components/ReflectiveMemberCard.tsx` | Card 270×460px com animação de aniversário (glow dourado), ID, status, ícones |

### Admin

| Componente | Arquivo | Função |
|-----------|---------|--------|
| **AdminCalendar** | `components/AdminCalendar.tsx` | Calendário interativo com reuniões (localStorage) e aniversários, navegação mensal |

---

## Features Implementadas

### Público

- Home completa com Hero, Sponsors, Destaques (Membro do Mês + Área em Foco), 6 sub-áreas técnicas com detalhes, histórico de competições 2015–2025
- Sistema de notícias com lista, detalhe por slug e skeleton loaders
- Página de membros agrupados por equipe com filtro dinâmico
- Formulário de contato de patrocínio

### Painel Admin (`/admin`)

- Dashboard com estatísticas em tempo real
- CRUD completo de notícias
- CRUD de membros com detecção de aniversário
- Gerenciamento de patrocinadores (add/remove com preview de logo)
- Edição de destaques (membro do mês + área em foco)
- Calendário com reuniões
- Contatos de patrocínio com pipeline de status (`pending → in_progress → won/lost`)

### Infraestrutura

- Context global (`ProjectContext`) gerenciando sponsors, news, members e highlight
- Cliente API com normalização snake_case ↔ camelCase e fallback localStorage
- Animações: Framer Motion (hero/stats), CSS keyframes (marquee, float, fadeIn), birthday pulse
- Responsividade completa com breakpoints Tailwind `md`/`lg`

---

## Tecnologias

| Categoria | Biblioteca | Versão |
|----------|-----------|--------|
| Framework | Next.js | 16.1.6 |
| UI | React | 19.2.3 |
| Linguagem | TypeScript | 5 |
| Estilo | Tailwind CSS | 4 |
| Animação | Framer Motion | 12.33.0 |
| Ícones | Lucide React | 0.563.0 |
| Variantes | class-variance-authority | 0.7.1 |
| Classes | clsx + tailwind-merge | 2.1.1 / 3.5.0 |

---

## Tipos Principais

```typescript
// types/member.ts
Member { id, name, role, team, photoUrl, email, linkedin, birthDate, active }

// services/api.ts
NewsItem   { id, title, summary, image, slug, created_at }
NewsDetail { ...NewsItem, content, author, category, published }
Highlight  { memberName, memberRole, memberPhoto, areaName, areaDesc, areaPhoto }

// types/sponsor.ts
Sponsor { name, logo_url }
```

---

## Endpoints de API Esperados (Backend em `http://127.0.0.1:8000`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/news` | Lista de notícias |
| GET | `/news/{slug}` | Detalhe de notícia por slug |
| POST | `/news` | Criar notícia |
| GET | `/sponsors` | Lista de patrocinadores |
| GET | `/members` | Lista de membros |
| POST | `/members` | Criar membro |
| DELETE | `/members/{id}` | Remover membro |
| GET | `/highlight` | Destaques (membro + área) |
| POST | `/contact/sponsor` | Enviar contato de patrocínio |
| PATCH | `/contact/sponsor/{id}/status` | Atualizar status de contato |
| GET | `/admin/dashboard` | Estatísticas do dashboard |
| POST | `/upload` | Upload de imagens |

---

## Pontos de Atenção para Análise

1. **Autenticação Admin**: Credenciais hardcoded (`admin@ufuracing.com` / `admin`) — sem proteção real
2. **API URL**: Apontada para `http://127.0.0.1:8000` — depende de backend local rodando
3. **Todos os pages usam `"use client"`** — sem aproveitamento de SSR/RSC do Next.js
4. **Imagens da Home**: Algumas vêm de Unsplash (URLs externas hardcoded)
5. **Dois componentes de marquee**: `LogoLoop` e `SponsorsMarquee` com funções sobrepostas
6. **localStorage como fallback**: Sponsors, News e Highlight cacheados localmente
7. **Rota de notícias**: Diretório se chama `[id]` mas o parâmetro usado é o `slug`
