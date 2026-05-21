# Plano de Ajustes SEO — GMÓBIL Landing Page

## Objetivo

Melhorar:

- SEO técnico
- indexação no Google
- posicionamento orgânico
- performance
- semântica HTML
- conversão da landing page
- Core Web Vitals
- CTR nos resultados de busca

---

## Objetivo

Melhorar ranqueamento para:

- software B2B
- força de vendas
- representantes comerciais
- aplicativo de vendas
- integração ERP

---

# 4. KEYWORDS IMPORTANTES

Inserir naturalmente no conteúdo:

- sistema força de vendas
- aplicativo para representantes comerciais
- software B2B
- plataforma de pedidos B2B
- portal do franqueado
- integração com ERP
- software para franquias
- catálogo digital B2B
- BI comercial
- dashboard de vendas
- aplicativo offline para vendas

---

# 5. AJUSTES NAS SEÇÕES

## Hero Section

### Sugestão de copy

```text
Software B2B completo para representantes comerciais, franquias e indústrias.

Centralize pedidos, catálogos, dashboards e força de vendas em uma única plataforma integrada ao seu ERP.
```

---

## Seção “Quem Somos”

### Sugestão

```text
A GMÓBIL é uma plataforma especializada em força de vendas B2B, automação comercial e integração com ERP.

Desenvolvemos soluções para representantes comerciais, franquias, lojas multimarcas e indústrias que desejam aumentar vendas, reduzir retrabalho e ter controle total da operação comercial.
```

---

## Seção AFV / Representantes

### Incluir termos:

- aplicativo para representantes comerciais
- sistema de pedidos
- força de vendas offline
- automação comercial

### Sugestão

```text
Aplicativo de força de vendas para representantes comerciais com funcionamento offline, catálogo digital e integração total com ERP.
```

---

## Seção BI

### Sugestão

```text
Business Intelligence integrado ao ERP com dashboards de vendas, faturamento, performance comercial e indicadores em tempo real.
```

---

# 6. ESTRUTURA SEMÂNTICA HTML

Substituir excesso de `<div>` por:

```html
<header>
  <main>
    <section>
      <article>
        <nav>
          <footer></footer>
        </nav>
      </article>
    </section>
  </main>
</header>
```

## Objetivo

Melhor compreensão do conteúdo pelos mecanismos de busca.

---

# 7. HIERARQUIA DE HEADINGS

## Ajustar estrutura:

- 1 H1 principal
- H2 para seções
- H3 para subtítulos

## Evitar:

- múltiplos H1
- headings fora de ordem

## Importante:

- Não alterar o layout atual das headings, nem os tamanhos e cores

---

# 8. IMAGENS E SEO

## Adicionar ALT descritivo

### Ruim

```html
alt="Catalogo"
```

### Melhor

```html
alt="Catálogo digital B2B para representantes comerciais"
```

---

# 9. PERFORMANCE DAS IMAGENS

## Implementar

- compressão
- lazy loading

## Exemplo

```html
<img loading="lazy" />
```

---

# 10. OPEN GRAPH

Adicionar:

```html
<meta property="og:title" content="GMÓBIL" />
<meta property="og:description" content="Software B2B para força de vendas" />
<meta property="og:image" content="/og-image.jpg" />
<meta property="og:type" content="website" />
```

---

# 11. TWITTER CARDS

Adicionar:

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="GMÓBIL" />
<meta name="twitter:description" content="Software B2B" />
```

---

# 12. CANONICAL URL

Adicionar:

```html
<link rel="canonical" href="https://carlosgiovane.github.io/gmobillanding/" />
```

---

# 13. SITEMAP.XML

Criar:

```xml
/sitemap.xml
```

## Objetivo

Melhor indexação no Google.

---

# 14. ROBOTS.TXT

Criar:

```txt
User-agent: *
Allow: /

Sitemap: https://carlosgiovane.github.io/gmobillanding/sitemap.xml
```

---

# 15. JSON-LD / SCHEMA.ORG

Adicionar estrutura:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GMÓBIL",
  "url": "https://carlosgiovane.github.io/gmobillanding/"
}
```

---

# 16. PÁGINAS INDIVIDUAIS PARA SEO

Criar páginas específicas:

```text
/forca-de-vendas
/software-b2b
/aplicativo-representante-comercial
/portal-franqueado
/business-intelligence
/integracao-erp
```

## Objetivo

Melhor posicionamento orgânico por palavra-chave.

---

# 17. BLOG SEO

## Criar blog técnico/comercial

### Sugestões de artigos

- Melhor sistema para representantes comerciais
- Como integrar força de vendas ao ERP
- Como vender offline com equipe externa
- O que é um portal B2B
- Como reduzir erros em pedidos comerciais
- Como usar BI para aumentar vendas

---

# 18. MELHORIAS DE CONVERSÃO

## Variar CTAs

Evitar repetir:

- Solicitar Demonstração

### Alternativas

- Agendar demonstração
- Ver plataforma em funcionamento
- Falar com especialista
- Solicitar apresentação
- Testar solução

---

# 19. PROVA SOCIAL

Adicionar:

- depoimentos
- cases
- métricas reais

## Exemplos

```text
Redução de 43% no tempo de emissão de pedidos.

Mais de 3 mil usuários ativos.
```

---

# 20. SEO LOCAL

Inserir menções estratégicas:

```text
Empresa especializada em software B2B e força de vendas no Paraná, atendendo clientes em todo o Brasil.
```

---

# 21. CORE WEB VITALS

## Melhorar:

- LCP
- CLS
- TBT
- FCP

## Ações

- reduzir imagens grandes
- reduzir JS desnecessário
- lazy loading
- compressão
- preload de fontes

---

# 22. CHECKLIST FINAL

## Alta prioridade

- [ ] Melhorar title
- [ ] Melhorar meta description
- [ ] Melhorar H1
- [ ] Inserir keywords estratégicas
- [ ] Melhorar headings
- [ ] Adicionar ALT nas imagens
- [ ] Open Graph
- [ ] Twitter Cards
- [ ] JSON-LD
- [ ] Sitemap
- [ ] Robots.txt

---

## Média prioridade

- [ ] Criar páginas específicas
- [ ] Criar blog
- [ ] Melhorar CTAs
- [ ] Adicionar cases
- [ ] Melhorar semântica HTML

---

## Performance

- [ ] Implementar lazy loading
- [ ] Otimizar bundles JS
- [ ] Melhorar Lighthouse

---

# Nota Atual do Projeto

## SEO atual

4.5/10

## Potencial orgânico

9/10

## Potencial de crescimento

Muito alto devido à baixa concorrência SEO técnica no nicho B2B no Brasil.
