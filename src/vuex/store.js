import { createStore } from "vuex";

export default createStore({
  state: {
    // ============================================
    // AUTENTICAÇÃO
    // ============================================
    userToken: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user") || "null"),

    // ============================================
    // CONTEXTO: SETOR ATUAL (Selecionado)
    // ============================================
    // Identificação do setor selecionado (do cookie/url)
    setorAtualId: null,
    setorAtualNome: null,

    // Detalhes completos do setor selecionado
    // { id, nome, tipo, status, estoque_flag, descricao, unidade: {...}, ... }
    setorDetails: null,

    // Dados de estoque do setor atual
    listEstoque: [],
    listEstoqueLote: [],

    // Movimentações do setor atual
    listMovimentacoes: [],

    // Entradas do setor atual
    listEntradas: [],

    // Usuários vinculados ao setor atual
    listUsuariosSetor: [],

    // ============================================
    // CONTEXTO: SETORES CONSUMIDORES
    // ============================================
    // Lista de setores consumidores (refatorado do antigo módulo de setores)
    setoresConsumidores: [],

    // Setor consumidor selecionado para visualizar/interagir
    setorConsumidorSelecionado: null,

    // ============================================
    // CABEÇALHO GLOBAL DA PÁGINA (HEADER)
    // ============================================
    pageTitle: null,
    pageSubtitle: null,

    // ============================================
    // DADOS GLOBAIS / COMPARTILHADOS
    // ============================================
    // Lista de setores que o usuário tem acesso (para seleção inicial)
    setoresComAcesso: [],

    // Modal genérico
    modalData: {
      modalTitle: "",
      modalFunction: "ADD",
      modalData: {},
      isModalOpen: false,
    },
    modalErrors: {},

    // Usuários e gestão
    listUsers: [],
    listTiposUsuarios: [],

    // Catálogos (compartilhados entre contextos)
    listProdutos: [],
    listUnidadesMedida: [],
    listGrupoProdutos: [],
    listFornecedores: [],
    listPolos: [],
    listUnidades: [],
    listPerfis: [],
    listTiposVinculo: [],

    relatorioEntradas: [],
    relatorioMovimentacoes: [],
    relatorioSaidas: [],
    relatorioSaidasPorData: [],
    relatorioEntradasPorData: [],
    relatorioEstoque: [],
    relatorioUsuarios: [],

    // Listas auxiliares
    listTiposVinculo: [],

    // UI / Filtros
    searchFilters: [],
    idDataLoaded: "",
    isSearching: "",

    // Compatibilidade com código legado
    listSetores: [],
    listSetoresGerais: [],
    setorAtual: null,
    gruposProdutos: [],
    unidadesMedidaAux: [],
  },
  mutations: {
    // ============================================
    // AUTENTICAÇÃO
    // ============================================
    setUserToken(state, token) {
      state.userToken = token;
      localStorage.setItem("token", token);
    },
    setUser(state, user) {
      state.user = user || null;
      try {
        if (user) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");
      } catch (e) {
        console.warn("Não foi possível persistir usuário no localStorage", e);
      }
    },
    clearUserToken(state) {
      state.userToken = null;
      localStorage.removeItem("token");
    },

    // ============================================
    // CONTEXTO: SETOR ATUAL
    // ============================================
    // Identidade do setor atual
    setSetorAtualId(state, { id, nome }) {
      state.setorAtualId = id;
      state.setorAtualNome = nome;
    },
    clearSetorAtualId(state) {
      state.setorAtualId = null;
      state.setorAtualNome = null;
    },

    // Compatibilidade com código antigo que usa setSetorAtual
    setSetorAtual(state, { id, nome }) {
      state.setorAtualId = id;
      state.setorAtualNome = nome;
    },
    clearSetorAtual(state) {
      state.setorAtualId = null;
      state.setorAtualNome = null;
    },

    // Detalhes do setor atual (compatibilidade com anterior)
    setSetorDetails(state, details) {
      state.setorDetails = details || null;
    },
    clearSetorDetails(state) {
      state.setorDetails = null;
    },

    // Estoque do setor atual
    setListEstoque(state, estoque) {
      state.listEstoque = estoque || [];
    },
    clearListEstoque(state) {
      state.listEstoque = [];
    },

    // Lotes de estoque do setor atual
    setListEstoqueLote(state, lotes) {
      state.listEstoqueLote = lotes || [];
    },
    clearListEstoqueLote(state) {
      state.listEstoqueLote = [];
    },

    // Movimentações do setor atual
    setListMovimentacoes(state, movimentacoes) {
      state.listMovimentacoes = movimentacoes || [];
    },
    clearListMovimentacoes(state) {
      state.listMovimentacoes = [];
    },

    // Entradas do setor atual
    setListEntradas(state, entradas) {
      state.listEntradas = entradas || [];
    },
    clearListEntradas(state) {
      state.listEntradas = [];
    },

    // Usuários do setor atual
    setListUsuariosSetor(state, usuarios) {
      state.listUsuariosSetor = usuarios || [];
    },
    clearListUsuariosSetor(state) {
      state.listUsuariosSetor = [];
    },

    // ============================================
    // CONTEXTO: SETORES CONSUMIDORES
    // ============================================
    setSetoresConsumidores(state, setores) {
      state.setoresConsumidores = setores || [];
    },
    clearSetoresConsumidores(state) {
      state.setoresConsumidores = [];
    },

    setSetorConsumidorSelecionado(state, setor) {
      state.setorConsumidorSelecionado = setor || null;
    },
    clearSetorConsumidorSelecionado(state) {
      state.setorConsumidorSelecionado = null;
    },

    // ============================================
    // CABEÇALHO GLOBAL DA PÁGINA
    // ============================================
    setPageHeader(state, payload) {
      state.pageTitle = payload?.title || null;
      state.pageSubtitle = payload?.subtitle || null;
    },
    clearPageHeader(state) {
      state.pageTitle = null;
      state.pageSubtitle = null;
    },

    // ============================================
    // DADOS GLOBAIS
    // ============================================
    setSetoresComAcesso(state, setores) {
      state.setoresComAcesso = setores || [];
    },

    // Modal
    setModalData(state, payload) {
      state.modalData.modalData = { ...state.modalData.modalData, ...payload };
    },
    resetModalData(state) {
      state.modalData.modalData = {
        status: "A",
        name: "",
        cpf: "",
        email: "",
        telefone: "",
        data_nascimento: "",
        tipo_vinculo: "",
        password: "",
      };
    },
    SET_MODAL_DATA(state, payload) {
      state.modalData.modalTitle = payload.modalTitle || "";
      state.modalData.modalData = payload.modalData || {};
      state.modalData.modalFunction = payload.modalFunction || "ADD";
    },
    setModalTitle(state, title) {
      state.modalData.modalTitle = title;
    },
    setModalFunction(state, func) {
      state.modalData.modalFunction = func;
    },
    setModalErrors(state, errors) {
      state.modalErrors = errors || {};
    },
    setModalOpen(state, isOpen) {
      state.modalData.isModalOpen = isOpen;
    },

    // Usuários
    setListUsers(state, users) {
      state.listUsers = users;
    },
    setListTiposUsuario(state, users) {
      state.listTiposUsuario = users;
    },
    // Catálogos
    setListSetores(state, setores) {
      state.listSetores = setores;
    },
    setListProdutos(state, produtos) {
      state.listProdutos = produtos;
    },
    setListGrupoProdutos(state, grupos) {
      state.listGrupoProdutos = grupos;
    },
    setListUnidadesMedida(state, unidadesMedida) {
      state.listUnidadesMedida = unidadesMedida;
    },
    setListUnidades(state, unidades) {
      state.listUnidades = unidades || [];
    },
    setListFornecedores(state, fornecedores) {
      state.listFornecedores = fornecedores;
    },
    setListPolos(state, polos) {
      state.listPolos = polos;
      // também atualizar listUnidades para manter compatibilidade com código novo
      state.listUnidades = polos;
    },
    setListPerfis(state, perfis) {
      state.listPerfis = perfis;
    },
    setListTiposVinculo(state, tipos) {
      state.listTiposVinculo = tipos;
    },

    // Compatibilidade com código legado
    setListSetoresGerais(state, setores) {
      state.listSetoresGerais = setores;
    },
    setSetorAtualCompat(state, setor) {
      state.setorAtual = setor;
    },

    // UI
    setIdDataLoaded(state, id) {
      state.idDataLoaded = id;
    },
    setisSearching(state, id) {
      state.isSearching = id;
    },
    setGruposProdutos(state, grupos) {
      state.gruposProdutos = grupos;
    },
    setUnidadesMedidaAux(state, unidades) {
      state.unidadesMedidaAux = unidades;
    },

    // ============================================
    // RELATÓRIOS
    // ============================================
    setRelatorioEntradas(state, entradas) {
      state.relatorioEntradas = entradas || [];
    },
    clearRelatorioEntradas(state) {
      state.relatorioEntradas = [];
    },

    setRelatorioMovimentacoes(state, movimentacoes) {
      state.relatorioMovimentacoes = movimentacoes || [];
    },
    clearRelatorioMovimentacoes(state) {
      state.relatorioMovimentacoes = [];
    },

    setRelatorioSaidas(state, saidas) {
      state.relatorioSaidas = saidas || [];
    },
    clearRelatorioSaidas(state) {
      state.relatorioSaidas = [];
    },

    setRelatorioSaidasPorData(state, saidasPorData) {
      state.relatorioSaidasPorData = saidasPorData || [];
    },
    clearRelatorioSaidasPorData(state) {
      state.relatorioSaidasPorData = [];
    },

    setRelatorioEntradasPorData(state, entradasPorData) {
      state.relatorioEntradasPorData = entradasPorData || [];
    },
    clearRelatorioEntradasPorData(state) {
      state.relatorioEntradasPorData = [];
    },

    setRelatorioEstoque(state, estoque) {
      state.relatorioEstoque = estoque || [];
    },
    clearRelatorioEstoque(state) {
      state.relatorioEstoque = [];
    },

    setRelatorioUsuarios(state, usuarios) {
      state.relatorioUsuarios = usuarios || [];
    },
    clearRelatorioUsuarios(state) {
      state.relatorioUsuarios = [];
    },

    setListTiposVinculo(state, tiposVinculo) {
      state.listTiposVinculo = tiposVinculo || [];
    },
  },
  actions: {
    // Você pode adicionar ações assíncronas aqui se necessário
  },
  getters: {
    // Autenticação
    getUserToken: (state) => state.userToken,

    // Setor Atual
    getSetorAtualId: (state) => state.setorAtualId,
    getSetorAtualNome: (state) => state.setorAtualNome,
    getSetorDetails: (state) => state.setorDetails,

    // Dados do Setor Atual
    getListEstoque: (state) => state.listEstoque,
    getListEstoqueLote: (state) => state.listEstoqueLote,
    getListMovimentacoes: (state) => state.listMovimentacoes,
    getListEntradas: (state) => state.listEntradas,
    getListUsuariosSetor: (state) => state.listUsuariosSetor,

    // Setores Consumidores
    getSetoresConsumidores: (state) => state.setoresConsumidores,
    getSetorConsumidorSelecionado: (state) => state.setorConsumidorSelecionado,

    // Dados Globais
    getSetoresComAcesso: (state) => state.setoresComAcesso,

    // Modal
    getModalData: (state) => state.modalData.modalData,
    getModalTitle: (state) => state.modalData.modalTitle,
    getModalFunction: (state) => state.modalData.modalFunction,
    getModalErrors: (state) => state.modalErrors,

    // Catálogos
    getListUsers: (state) => state.listUsers,
    getListTiposUsuario: (state) => state.listTiposUsuario,
    getListProdutos: (state) => state.listProdutos,
    getListUnidadesMedida: (state) => state.listUnidadesMedida,
    getListGrupoProdutos: (state) => state.listGrupoProdutos,
    getListFornecedores: (state) => state.listFornecedores,
    getListPolos: (state) => state.listPolos,
    getListUnidades: (state) => state.listUnidades,
    getListPerfis: (state) => state.listPerfis,
    getListTiposVinculo: (state) => state.listTiposVinculo,

    // Relatórios
    getRelatorioEntradas: (state) => state.relatorioEntradas,
    getRelatorioMovimentacoes: (state) => state.relatorioMovimentacoes,
    getRelatorioSaidas: (state) => state.relatorioSaidas,
    getRelatorioSaidasPorData: (state) => state.relatorioSaidasPorData,
  },
});
