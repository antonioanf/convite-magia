# Academia de Magia de Valdoria

Convite digital mobile-first feito com Vite, React e TypeScript. As cenas usam Framer Motion e GSAP; as partículas e a revelação por varinha são desenhadas em Canvas 2D.

## Personalizar para outra festa

Edite somente `src/config/convite.ts` para alterar o nome da academia e seu lema, nome e idade da criança, data com fuso horário, local, mapa, WhatsApp dos responsáveis, prazo de confirmação, traje, presentes, chave Pix, música, fundos, paleta, cenas e medalhões. O WhatsApp deve conter apenas dígitos, com DDI e DDD (por exemplo, `5511999999999`). Configure também a chave Pix e o nome do titular antes de publicar, se for exibi-los.

Edite `assets` e `backgrounds` em `src/config/convite.ts` para trocar os assets sem alterar os componentes. Os caminhos atuais são:

| Asset | Arquivo usado pelo convite |
|---|---|
| Castelo noturno | `public/cenas/01-castelo/castelo.webp` |
| Biblioteca (fundo do livro, da carta e do convite final) | `public/cenas/02-livro/fundo.webp` |
| Livro recortado com transparência | `public/cenas/02-livro/livro.png` |
| Envelope recortado com transparência | `public/cenas/03-carta/envelope.png` |
| Pergaminho com mapa | `public/cenas/04-pergaminho/pergaminho.webp` |
| Varinha recortada com transparência | `public/cenas/05-varinha/varinha.png` |
| Chapéu recortado com transparência | `public/cenas/07-chapeu/chapeu.png` |

As imagens-fonte recebidas foram copiadas, sem edição, para `imagens-originais/`. Essa pasta é ignorada pelo Git e deve ser mantida como backup. O recorte do livro veio da imagem completa da biblioteca; a silhueta do envelope foi refinada para remover o cenário sem perder o selo.

`backgrounds` aceita caminhos antigos de imagem única e também camadas por cena:

```ts
backgrounds: {
  castle: {
    background: '/cenas/castelo/fundo.webp',
    middle: '/cenas/castelo/meio.webp',
    foreground: '/cenas/castelo/frente.png',
  },
  book: {
    background: '/cenas/livro/fundo.webp',
    middle: '/cenas/livro/meio.webp',
  },
}
```

Adicione as imagens em `public/cenas/<cena>/`. As camadas ficam atrás dos efeitos de código: luz, partículas, névoa, gradação e conteúdo. Para melhor resultado, use fundos em retrato **1080 × 1920 px** (9:16), WebP com até **250 KB**; recortes transparentes em PNG com até **1200 px** no maior lado e até **150 KB**. Prepare camadas separadas e alinhadas (fundo distante, plano médio e primeiro plano) com folga de 8–12% nas bordas para o parallax. Evite texto dentro das imagens.

Separe a composição em três planos: fundo distante com céu/montanhas; plano médio com castelo ou cenário; primeiro plano transparente com árvores, molduras ou objetos. Mantenha cada camada alinhada na mesma tela de 1080 × 1920. Use WebP para fotografias e PNG para elementos com transparência. O convite pré-carrega a cena seguinte e aplica as posições percentuais de luzes configuradas em `lightSources`; ajuste esses pontos quando trocar um cenário.

Para otimizar as imagens depois de substituí-las:

```bash
npm run otimizar-imagens
```

O script usa `sharp`, converte os três fundos-fonte de `imagens-originais/` para WebP 1080 × 1920 e otimiza os quatro PNGs com alpha nos caminhos acima. Ele valida os limites de tamanho e interrompe com erro explícito se uma imagem não puder atendê-los. Para trocar um fundo, atualize o arquivo-fonte correspondente em `imagens-originais/`; para trocar um objeto, substitua o PNG transparente no destino antes de executar o script.

Para ativar música, coloque um MP3 pequeno em `public/` e informe seu caminho em `music` (por exemplo, `/musica.mp3`). O áudio só inicia depois da primeira interação, conforme as regras do navegador.

Os dados de exemplo são fictícios. Troque o telefone antes de usar confirmação pelo WhatsApp. Sem um telefone configurado, o formulário explica o que falta e não abre um link inválido.

## Executar e validar

```bash
npm install
npm run dev
npm run build
```

Para testar em um celular conectado à mesma rede Wi-Fi:

```bash
npm run dev -- --host
```

Abra no celular o endereço de rede mostrado pelo Vite. Confira especialmente 360×740, 390×844 e 430×932; em desktop, a experiência fica centralizada em uma moldura de celular.

## Publicar

- **Vercel:** importe o repositório, mantenha o comando de build `npm run build` e a pasta de saída `dist`.
- **Netlify:** use `npm run build` como comando de build e `dist` como diretório de publicação.

Tailwind CSS v4 estiliza a interface, Framer Motion e GSAP animam, Canvas 2D desenha partículas, chamas, luzes e a máscara de revelação, `canvas-confetti` celebra as interações, e `sharp` prepara os assets. DeviceOrientation habilita parallax quando permitido pelo navegador e há movimento automático como fallback.
