import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import SetorSelectionView from "../views/SetorSelectionView.vue";
import HistoricoDePedidosView from "@/views/roleSolicitante/HistoricoDePedidosView.vue";
import ItensView from "@/views/roleSolicitante/ItensView.vue";
import SetorAtualView from "@/views/SetorAtualView.vue";
import { setorCookie } from "@/utils/setorCookie";
import axios from "axios";
import store from "@/vuex/store";
import functionsSetor from "@/functions/cad_setores";
import functionsUsuarioSetor from "@/functions/cad_usuario_setor";

// cadastros
import Home from "@/views/Home.vue";
import About from "@/views/About.vue";
import Users from "../views/cadastros/Users.vue";

import SetorDetalhes from "../views/cadastros/SetorDetalhes.vue";
import Produtos from "../views/cadastros/Produtos.vue";
import UnidadesMedida from "../views/cadastros/UnidadesMedida.vue";
import Fornecedores from "../views/cadastros/Fornecedores.vue";
import GrupoProduto from "../views/cadastros/GrupoProduto.vue";
import Polos from "../views/cadastros/Polos.vue";
import Perfis from "../views/cadastros/Perfis.vue";
import CategoriasProdutos from "../views/cadastros/CategoriasProdutos.vue";
import Estoque from "@/views/cadastros/Estoque.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/setor-selection",
      name: "setorSelection",
      component: SetorSelectionView,
      meta: { requiresAuth: true, requiresSector: false },
    },
    {
      path: "/home",
      name: "home",
      component: Home,
    },
    {
      path: "/about",
      name: "about",
      component: About,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      redirect: "/home",
    },
    {
      path: "/setor-atual",
      name: "setorAtual",
      component: SetorAtualView,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/users",
      name: "users",
      component: Users,
      meta: { requiresAuth: true, requiresSector: true },
    },

    {
      path: "/setor/:id",
      name: "setorDetalhes",
      component: SetorDetalhes,
      meta: { requiresAuth: true, requiresSector: true },
      props: true,
    },
    {
      path: "/perfis",
      name: "perfis",
      component: Perfis,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/produtos",
      name: "produtos",
      component: Produtos,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/itens",
      name: "itens",
      component: ItensView,
      meta: { requiresAuth: true, requiresSector: true },
    },
    /* categoriasProdutos removed in favor of grupoProduto */
    {
      path: "/grupoProduto",
      name: "grupoProduto",
      component: GrupoProduto,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/unidadesMedida",
      name: "unidadesMedida",
      component: UnidadesMedida,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/fornecedores",
      name: "fornecedores",
      component: Fornecedores,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/unidades",
      name: "unidades",
      component: Polos,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/historico",
      name: "historico",
      component: HistoricoDePedidosView,
      meta: { requiresAuth: true, requiresSector: true },
    },
    // Relatórios (placeholders / views de relatórios)
    {
      path: "/relatorios",
      name: "relatorios",
      component: () => import("@/views/relatorios/Relatorios.vue"),
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/relatorios/entradas",
      name: "relatoriosEntradas",
      component: () => import("@/views/relatorios/EntradasReport.vue"),
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/relatorios/movimentacoes",
      name: "relatoriosMovimentacoes",
      component: () => import("@/views/relatorios/MovimentacoesReport.vue"),
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/relatorios/saidas",
      name: "relatoriosSaidas",
      component: () => import("@/views/relatorios/SaidasReport.vue"),
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/relatorios/saidas-por-data",
      name: "relatoriosSaidasPorData",
      component: () => import("@/views/relatorios/SaidasPorDataReport.vue"),
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/relatorios/entradas-por-data",
      name: "relatoriosEntradasPorData",
      component: () => import("@/views/relatorios/EntradasPorDataReport.vue"),
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/relatorios/estoque",
      name: "relatoriosEstoque",
      component: () => import("@/views/relatorios/EstoqueReport.vue"),
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/relatorios/usuarios",
      name: "relatoriosUsuarios",
      component: () => import("@/views/relatorios/UsuariosReport.vue"),
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: (to) => {
        const isAuthenticated = localStorage.getItem("token");
        return isAuthenticated ? "/setor-atual" : "/login";
      },
    },
    {
      path: "/setores-consumidores",
      name: "SetoresConsumidoresList",
      component: () => import("../views/SetoresConsumidoresListView.vue"),
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/setores-consumidores/:id",
      name: "SetorConsumidor",
      component: () => import("../views/SetorConsumidorView.vue"),
      meta: { requiresAuth: true, requiresSector: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const isAuthenticated = localStorage.getItem("token");
  const hasSector = setorCookie.hasSector();

  // Helper to determine if logged user is 'solicitante' for the current sector
  const checkIsSolicitante = async () => {
    const user = store.state.user;
    if (!user) return false;

    try {
      let list = store.state.listUsuariosSetor || [];

      // If not loaded yet, try to fetch user-setor vínculos
      if (
        (!list || list.length === 0) &&
        functionsUsuarioSetor &&
        functionsUsuarioSetor.listAll
      ) {
        try {
          await functionsUsuarioSetor.listAll({ $axios: axios, $store: store });
          list = store.state.listUsuariosSetor || [];
        } catch (e) {
          console.warn(
            "checkIsSolicitante: erro ao carregar usuarios do setor",
            e,
          );
        }
      }

      const found = list.find((u) => {
        const userId =
          u.usuario_id || u.user_id || u.id || (u.usuario && u.usuario.id);
        const perfil = (u.perfil || (u.pivot && u.pivot.perfil) || "")
          .toString()
          .toLowerCase();
        return (
          userId === user.id &&
          (perfil === "solicitante" || perfil.includes("solicitante"))
        );
      });

      if (found) return true;
    } catch (e) {
      console.warn("Erro ao avaliar solicitante no guard:", e);
    }

    // fallback to roles/perfil on user object
    const userObj = store.state.user || {};
    if (
      (userObj.roles &&
        userObj.roles.includes &&
        userObj.roles.includes("solicitante")) ||
      (userObj.perfil &&
        userObj.perfil.toString().toLowerCase().includes("solicitante"))
    )
      return true;

    return false;
  };

  // Se a rota requer autenticação e não está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    setorCookie.clearSector();
    next("/login");
    return;
  }

  // Se está autenticado e tenta acessar login/register, redirecionar para seleção de setor ou dashboard
  if (isAuthenticated && (to.path === "/login" || to.path === "/register")) {
    if (hasSector) {
      // Redireciona para setor-atual
      next("/setor-atual");
    } else {
      next("/setor-selection");
    }
    return;
  }

  // Se a rota requer setor selecionado e não tem
  if (to.meta.requiresSector && !hasSector) {
    next("/setor-selection");
    return;
  }

  // Se não está autenticado e tenta fazer logout (limpar cookies)
  if (!isAuthenticated && hasSector) {
    setorCookie.clearSector();
  }

  // ✅ Carregar detalhes do setor se necessário
  if (to.meta.requiresSector && hasSector && isAuthenticated) {
    try {
      const setorId = setorCookie.getSectorId();
      const setorNome = setorCookie.getSectorName();

      // Restaurar estado do setor a partir dos cookies
      if (setorId && setorNome) {
        store.commit("setSetorAtual", {
          id: setorId,
          nome: setorNome,
        });
      }

      // Só carrega detalhes se não tem ou se é um setor diferente
      if (
        setorId &&
        (!store.state.setorDetails || store.state.setorDetails.id != setorId)
      ) {
        // Usar a função getSetorDetail que carrega setor + fornecedores relacionados
        const result = await functionsSetor.getSetorDetail(
          { $axios: axios, $store: store },
          setorId,
        );

        if (result.success) {
          // Já foi armazenado no Vuex pela função getSetorDetail
        } else {
          console.warn(
            "Aviso: não foi possível carregar detalhes do setor:",
            result.message,
          );
        }
      }
    } catch (error) {
      console.warn("Aviso: não foi possível carregar detalhes do setor");
    }
  }

  // Bloquear acesso a rotas de gerenciamento para solicitantes
  if (isAuthenticated && hasSector) {
    const isSolic = await checkIsSolicitante();
    const allowedForSolicitante = [
      "/dashboard",
      "/setor-atual",
      "/itens",
      "/setor-selection",
      "/login",
      "/register",
    ];
    if (
      isSolic &&
      to.meta &&
      to.meta.requiresSector &&
      !allowedForSolicitante.includes(to.path)
    ) {
      next("/setor-atual");
      return;
    }
  }

  next();
});

export default router;
