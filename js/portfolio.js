// Para cadastrar um novo projeto no portfolio:
// 1. Coloque a imagem ou o video em images/produtos/.
// 2. Duplique um objeto abaixo.
// 3. Atualize id, titulo, categoria, imagem, descricao e detalhes.
// 4. Salve o arquivo. O site atualiza o portfolio automaticamente.

window.MIU_PORTFOLIO = {
  items: [
    {
      id: "banguela",
      title: "Banguela",
      category: "Personagens",
      label: "Destaque",
      image: "images/produtos/banguela.jpeg",
      imageAlt: "Peca do personagem Banguela produzida em impressao 3D",
      description:
        "Peca decorativa com presenca forte e acabamento que valoriza o personagem sem perder a leitura dos detalhes.",
      details: [
        "Otima inspiracao para presentes, estantes e setups geek.",
        "Mostra bom equilibrio entre silhueta marcante e acabamento limpo.",
        "Serve como base para pedidos inspirados em personagens iconicos."
      ],
      featured: true
    },
    {
      id: "hunterxhunter",
      title: "Hunter x Hunter",
      category: "Anime",
      label: "Destaque",
      image: "images/produtos/hunterxhunter.jpeg",
      imageAlt: "Peca inspirada em Hunter x Hunter produzida em impressao 3D",
      description:
        "Referencia de anime transformada em peca de impacto para colecao, presente ou decoracao personalizada.",
      details: [
        "Boa inspiracao para projetos baseados em manga e anime.",
        "Composicao pensada para destacar contraste e identidade visual.",
        "Funciona bem como ponto de partida para novas versoes personalizadas."
      ],
      featured: true
    },
    {
      id: "yoshi",
      title: "Yoshi",
      category: "Games",
      label: "Destaque",
      image: "images/produtos/yoshi.jpeg",
      imageAlt: "Peca do personagem Yoshi produzida em impressao 3D",
      description:
        "Uma peca vibrante que mostra como personagens de games podem ganhar volume, cor e presenca fora da tela.",
      details: [
        "Boa referencia para pedidos com visual ludico e marcante.",
        "Fica muito bem em quarto, estante ou setup.",
        "Tambem aparece em video para revelar melhor o acabamento final."
      ],
      featured: true
    },
    {
      id: "jack-skellington",
      title: "Suporte Alexa Jack Skellington",
      category: "Decoracao Geek",
      label: "Grande procura",
      image: "images/produtos/jack.png",
      imageAlt: "Suporte para Alexa inspirado em Jack Skellington",
      description:
        "Suporte tematico que organiza a Alexa e ainda vira destaque na decoracao do ambiente.",
      details: [
        "Une utilidade e identidade visual em uma peca so.",
        "Boa inspiracao para suportes tematicos e decorativos.",
        "Mostra como a personalizacao pode entrar na rotina com estilo."
      ],
      featured: false
    },
    {
      id: "mao-caveira",
      title: "Suporte Alexa Mao Caveira",
      category: "Decoracao Geek",
      label: "Grande procura",
      image: "images/produtos/maocaveira.png",
      imageAlt: "Suporte em formato de mao caveira para Alexa",
      description:
        "Peca com personalidade forte para transformar um item funcional em parte da decoracao.",
      details: [
        "Tema de impacto com leitura visual imediata.",
        "Mistura decoracao, utilidade e presenca no ambiente.",
        "Otimo ponto de partida para novos suportes personalizados."
      ],
      featured: false
    },
    {
      id: "suporte-vr",
      title: "Suporte para Headset VR",
      category: "Organizacao",
      label: "Grande procura",
      image: "images/produtos/vr.png",
      imageAlt: "Suporte para headset VR e controles produzido em impressao 3D",
      description:
        "Base organizadora para headset e controles, pensada para deixar o setup limpo, firme e visualmente bem resolvido.",
      details: [
        "Boa referencia para organizacao de bancada gamer.",
        "Mostra uma peca funcional com acabamento limpo e estavel.",
        "Pode inspirar novos suportes e bases feitas sob medida."
      ],
      featured: false
    }
  ],
  featuredVideo: {
    title: "Yoshi em movimento",
    description:
      "No video, fica mais facil perceber volume, luz e presenca da peca pronta de um jeito que a foto sozinha nao mostra.",
    video: "images/produtos/yoshi.mp4",
    poster: "images/produtos/yoshi.jpeg",
    ctaMessage:
      "Ola! Vi o video do Yoshi no portfolio da Miu Lab 3D e quero uma peca nesse estilo."
  }
};
