/**
 * Funções para gerenciamento de tipos de vínculo
 */

/**
 * Lista todos os tipos de vínculo
 * @param {Object} content - Contexto do componente Vue (this)
 */
var listAll = (content) => {
  console.log("📋 Carregando tipos de vínculo: POST /tipo-vinculo/list");

  const payload = {
    filters: {},
  };

  return content.$axios
    .post("/tipo-vinculo/list", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("✅ Resposta da API - Tipos de Vínculo:", response.data);

      if (response.data && (response.data.status === true || response.data.status === "success")) {
        // Extrair lista de tipos de vínculo
        let tiposVinculo = [];
        
        if (Array.isArray(response.data.data)) {
          tiposVinculo = response.data.data;
        } else if (response.data.data && Array.isArray(response.data.data.data)) {
          tiposVinculo = response.data.data.data;
        } else if (response.data.data) {
          tiposVinculo = [response.data.data];
        }

        console.log(`📊 Tipos de vínculo encontrados: ${tiposVinculo.length}`);

        // Commit no Vuex store
        content.$store.commit("setListTiposVinculo", tiposVinculo);
        
        return { success: true, data: tiposVinculo };
      } else {
        console.warn("⚠️ Resposta da API sem dados válidos:", response.data);
        content.$store.commit("setListTiposVinculo", []);
        return { success: false, data: [] };
      }
    })
    .catch((error) => {
      console.error("❌ Erro ao carregar tipos de vínculo:", error);
      console.error("Resposta de erro:", error.response?.data);

      // Notificação de erro (defensiva)
      try {
        if (content.$toastr && content.$toastr.e) {
          const mensagem =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Erro ao carregar tipos de vínculo";
          content.$toastr.e(mensagem);
        }
      } catch (e) {
        console.warn("Erro ao exibir notificação:", e);
      }

      content.$store.commit("setListTiposVinculo", []);
      return { success: false, data: [], error };
    });
};

export default {
  listAll,
};
