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
      category: "Luminária",
      label: "Destaque",
      image: "images/produtos/banguela.jpeg",
      imageAlt: "Peça do personagem Banguela produzida em impressão 3D",
      description:
        "Peça decorativa com presença forte e acabamento que valoriza o personagem sem perder a leitura dos detalhes.",
      details: [
        "ótima inspiração para presentes, estantes e setups geek.",
        "Mostra bom equilíbrio entre silhueta marcante e acabamento limpo.",
        "Serve como base para pedidos inspirados em personagens icônicos."
      ],
      featured: true
    },
    {
      id: "hunterxhunter",
      title: "Hunter x Hunter",
      category: "Luminária",
      label: "Destaque",
      image: "images/produtos/hunterxhunter.jpeg",
      imageAlt: "Peça inspirada em Hunter x Hunter produzida em impressão 3D",
      description:
        "Referência de anime transformada em peça de impacto para coleção, presente ou decoração personalizada.",
      details: [
        "Boa inspiração para projetos baseados em manga e anime.",
        "Composição pensada para destacar contraste e identidade visual.",
        "Funciona bem como ponto de partida para novas versões personalizadas."
      ],
      featured: true
    },
    {
      id: "yoshi",
      title: "Yoshi",
      category: "Luminária",
      label: "Destaque",
      image: "images/produtos/yoshi.jpeg",
      imageAlt: "Peça do personagem Yoshi produzida em impressão 3D",
      description:
        "Uma peça vibrante que mostra como personagens de games podem ganhar volume, cor e presenca fora da tela.",
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
      category: "Decoração Geek",
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
      category: "Decoração Geek",
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
      category: "Organização",
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
    },
    {
      id: "topo-de-bolo",
      title: "Topo de Bolo Personalizado",
      category: "Decoração de Festas",
      label: "Personalizado",
      image: "images/produtos/topobolo.png",
      imageAlt: "Topo de bolo personalizado com nome, idade e escrita em relevo",
      description:
        "Peça feita para decorar a festa com acabamento limpo, boa leitura visual e personalização nos detalhes.",
      details: [
        "Ótima referência para topo de bolo com nome, idade e tema da comemoração.",
        "Combina presença visual com leveza para destacar a mesa principal.",
        "Pode servir de base para novos pedidos personalizados para aniversários e eventos."
      ],
      featured: false
    },
    {
      id: "lembrancinha-batizado",
      title: "Lembrancinhas Personalizados",
      category: "Lembrancinhas para Festas",
      label: "Personalizado",
      image: "images/produtos/batizado.png",
      imageAlt: "Lembrancinha personalizada de batizado com anjinha em relevo",
      description:
        "Lembrancinha delicada e encantadora, perfeita para batizados, aniversários, casamentos, chá revelação e outras ocasiões especiais.",
      details: [
        "Boa inspiração para peças personalizadas com nome, data e tema religioso.",
        "Mostra um resultado delicado, ideal para lembranças de eventos especiais.",
        "Pode ser adaptada para outras celebrações com cores, textos e detalhes sob medida."
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
