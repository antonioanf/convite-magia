# ✨ Academia de Magia de Valdoria

### Uma experiência mágica. Um convite extraordinário.

A **Academia de Magia de Valdoria** é um convite digital interativo desenvolvido para transformar uma simples comemoração em uma verdadeira jornada pelo universo da magia.

Criado com uma abordagem *mobile-first*, o projeto conduz os convidados por uma sequência de cenas encantadas, como se estivessem recebendo uma convocação oficial para ingressar em uma antiga academia de magia.

Cada interação revela um novo capítulo dessa aventura: um castelo misterioso, um livro encantado, uma carta de admissão, um mapa mágico e uma experiência especial com varinha.

Mais do que apresentar informações sobre uma festa, Valdoria foi concebida para despertar curiosidade, criar expectativa e proporcionar uma experiência memorável antes mesmo do grande dia.

---

## 🏰 A experiência de Valdoria

O convite é construído como uma pequena narrativa interativa, na qual cada etapa tem sua própria atmosfera visual e propósito.

- **O Castelo de Valdoria:** a entrada para um mundo de mistério e encantamento.
- **O Livro Encantado:** a descoberta dos primeiros segredos da academia.
- **A Carta de Admissão:** o convite oficial para fazer parte desse universo.
- **O Pergaminho Mágico:** a revelação das informações da celebração.
- **A Varinha Mágica:** uma interação especial que transforma a experiência.
- **O Chapéu Seletor:** um momento temático de descoberta.
- **O Convite Final:** todas as informações reunidas para os convidados.

Cada cena combina elementos visuais, animações e efeitos para criar uma experiência fluida e envolvente.

## ✨ Tecnologia por trás da magia

O projeto utiliza tecnologias modernas para proporcionar uma experiência visual rica, responsiva e otimizada.

| Tecnologia | Aplicação |
|---|---|
| React | Construção da interface e componentes |
| TypeScript | Estruturação e segurança do código |
| Vite | Desenvolvimento e compilação |
| Tailwind CSS v4 | Estilização da interface |
| Framer Motion | Animações e transições |
| GSAP | Animações avançadas e sequências |
| Canvas 2D | Partículas, luzes, chamas e efeitos mágicos |
| canvas-confetti | Efeitos comemorativos |
| Sharp | Otimização de imagens |

O projeto também utiliza DeviceOrientation para efeitos de movimento e parallax em dispositivos compatíveis, com animações automáticas como alternativa.

## 📱 Experiência mobile-first

A experiência foi projetada prioritariamente para celulares, onde o convite pode ser explorado de maneira natural e intuitiva.

- Interface adaptada a diferentes tamanhos de tela.
- Cenas com proporção visual inspirada no formato 9:16.
- Animações suaves e transições entre ambientes.
- Efeitos visuais renderizados em Canvas 2D.
- Pré-carregamento da próxima cena.
- Experiência centralizada em uma moldura de celular em telas desktop.

Resoluções de referência para validação:

- 360 × 740 px
- 390 × 844 px
- 430 × 932 px

## 🪄 Personalização do convite

Toda a configuração principal está concentrada em:

`src/config/convite.ts`

Esse arquivo permite adaptar a experiência para outra comemoração sem precisar modificar os componentes da aplicação.

É possível personalizar:

- Nome e lema da academia.
- Nome e idade da criança.
- Data, horário e fuso horário.
- Endereço e localização no mapa.
- WhatsApp dos responsáveis.
- Prazo para confirmação de presença.
- Traje recomendado.
- Informações sobre presentes.
- Chave Pix e nome do titular.
- Música de fundo.
- Paleta de cores e cenários.
- Cenas, medalhões e efeitos visuais.

Os dados de exemplo são fictícios. Antes de publicar, configure os dados reais, especialmente o telefone e as informações de pagamento, caso sejam exibidas.

## 🎨 Cenários e elementos visuais

Os recursos gráficos estão organizados na pasta `public/cenas/`.

| Elemento | Arquivo |
|---|---|
| Castelo noturno | `01-castelo/castelo.webp` |
| Biblioteca | `02-livro/fundo.webp` |
| Livro encantado | `02-livro/livro.png` |
| Envelope mágico | `03-carta/envelope.png` |
| Pergaminho | `04-pergaminho/pergaminho.webp` |
| Varinha | `05-varinha/varinha.png` |
| Chapéu | `07-chapeu/chapeu.png` |

As imagens originais recebidas estão preservadas em `imagens-originais/`, utilizada como backup e ignorada pelo Git.

### Preparação dos assets

Para manter a qualidade visual e o desempenho:

- Fundos preferencialmente em 1080 × 1920 px.
- Imagens fotográficas em WebP.
- Elementos transparentes em PNG.
- Fundos com até 250 KB.
- Elementos transparentes com até 150 KB.
- Composições alinhadas para permitir efeitos de parallax.
- Evite inserir textos diretamente nas imagens.

O projeto também aceita fundos em múltiplas camadas, permitindo separar cenário distante, plano médio e primeiro plano.

Para otimizar os arquivos após substituí-los:

`npm run otimizar-imagens`

O script utiliza Sharp para converter e validar os recursos gráficos.

## 🎵 Música e efeitos

A experiência pode incluir música ambiente para reforçar a atmosfera de fantasia.

Para ativá-la:

1. Adicione um arquivo MP3 leve dentro de `public/`.
2. Configure o caminho em `music`, no arquivo `src/config/convite.ts`.
3. A reprodução será iniciada após a primeira interação do visitante, respeitando as políticas dos navegadores.

## 🚀 Como executar

Pré-requisitos: Node.js e npm instalados.

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Para acessar pelo celular na mesma rede Wi-Fi:

```bash
npm run dev -- --host 0.0.0.0
```

Utilize no navegador do celular o endereço de rede informado pelo Vite.

### Validar a versão de produção

```bash
npm run build
```

## 🌐 Publicação

O projeto pode ser publicado em plataformas de hospedagem modernas.

**Vercel**
- Build Command: `npm run build`
- Output Directory: `dist`

**Netlify**
- Build Command: `npm run build`
- Publish Directory: `dist`

Após a publicação, o convite poderá ser acessado por um link e compartilhado diretamente com os convidados.

---

*Academia de Magia de Valdoria*

**Onde cada convite é uma convocação para o extraordinário.** 🪄
