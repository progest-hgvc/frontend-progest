<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <!-- Filters & Search -->
          <div class="row mb-4">
            <div class="col-12">
              <Card>
                <CardContent class="p-4">
                  <div
                    class="flex flex-col md:flex-row gap-4 align-items-center"
                  >
                    <div class="flex-1 flex items-center gap-2">
                      <Input
                        v-model="searchTerm"
                        placeholder="Pesquisar setor por nome..."
                        class="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="row">
            <div class="col-12 text-center py-5">
              <LoadingSpinner size="lg" />
              <p class="text-muted mt-3">
                {{ loadingMessage || "Carregando setores..." }}
              </p>
            </div>
          </div>

          <!-- List of Sectors -->
          <div v-else class="row">
            <div
              v-for="setor in filteredSetores"
              :key="setor.id"
              class="col-md-6 col-xl-4 mb-4"
            >
              <Card
                class="h-100 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                @click="navigateToSetor(setor.id)"
              >
                <CardContent class="p-4">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-blue-50 rounded-lg">
                        <i class="mdi mdi-store text-2xl text-blue-600"></i>
                      </div>
                      <div>
                        <h5 class="font-bold text-lg mb-1">{{ setor.nome }}</h5>
                        <p class="text-sm text-muted-foreground">
                          {{ setor.unidade?.nome || "Unidade não informada" }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Stock Info (if available, mostly placeholder as API might not return it yet) -->
                  <!-- The user asked to filter out sectors without stock. 
                       If the API doesn't provide stock info, we can't fully filter yet,
                       but we show what we have. -->
                  <!-- 
                  <div class="mt-4 pt-3 border-t flex justify-between items-center">
                     <Badge variant="outline" class="bg-gray-50">
                        Clique para ver estoque
                     </Badge>
                  </div> 
                  -->
                </CardContent>
              </Card>
            </div>

            <!-- Empty State -->
            <div
              v-if="filteredSetores.length === 0"
              class="col-12 text-center py-5"
            >
              <div class="flex flex-col items-center justify-center">
                <i
                  class="mdi mdi-store-remove text-6xl text-muted-foreground mb-4"
                ></i>
                <h3 class="text-xl font-semibold text-gray-700">
                  Nenhum setor encontrado
                </h3>
                <p class="text-muted-foreground">Tente ajustar sua pesquisa.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import { API_URL } from "@/config";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import functionsEstoque from "@/functions/cad_estoque"; // Importar função de estoque

const router = useRouter();
const store = useStore();

const loading = ref(true);
const setores = ref([]);
const searchTerm = ref("");
const loadingMessage = ref("Carregando setores...");

// Filter sectors
const filteredSetores = computed(() => {
  let result = setores.value;

  // Filter by name
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    result = result.filter((s) => s.nome.toLowerCase().includes(term));
  }

  return result;
});

const loadSetoresConsumidores = async () => {
  loading.value = true;
  loadingMessage.value = "Buscando setores...";
  const setorDetails = store.state.setorDetails;

  if (!setorDetails || !setorDetails.id) {
    loading.value = false;
    return;
  }

  try {
    // 1. Buscar lista de setores consumidores
    const response = await axios.post(
      `${API_URL}/setores/listConsumers`,
      { id: setorDetails.id },
      {
        headers: {
          Authorization: `Bearer ${store.getters.getUserToken}`,
        },
      },
    );

    if (response.data.status && response.data.data) {
      const todosSetores = response.data.data;

      // 2. Filtrar setores que possuem estoque
      loadingMessage.value = "Verificando disponibilidade de estoque...";

      const promises = todosSetores.map(async (setor) => {
        try {
          // Quando o backend já informa o indicador, ele é a fonte de verdade.
          if (Object.prototype.hasOwnProperty.call(setor, "estoque")) {
            return setor.estoque ? setor : null;
          }

          // Precisamos checar o estoque de cada setor.
          // Usaremos uma chamada leve ou a listEstoqueUnidade já existente.
          // Como listEstoqueUnidade espera um 'content' complexo, vamos simular ou chamar direto via axios se preferir
          // Mas para reuso, vamos adaptar o contexto.

          // Otimização: Se houver muitos setores, isso pode ser pesado.
          // O ideal seria o backend filtrar, mas faremos no front conforme solicitado.

          const context = {
            $axios: axios,
            $store: store,
            $toastr: undefined,
            loading: false,
            // Mocks para evitar erros
            estoqueItems: { value: [] },
            resumoEstoque: { value: {} },
            setorEstoque: { value: {} },
          };

          const result = await functionsEstoque.listEstoqueUnidade(
            context,
            setor.id,
          );

          const success = Boolean(result?.success ?? result?.status);
          const estoqueRaw = result?.data;
          const estoqueList = Array.isArray(estoqueRaw)
            ? estoqueRaw
            : Array.isArray(estoqueRaw?.estoque)
              ? estoqueRaw.estoque
              : [];

          if (success && estoqueList.length > 0) {
            // Verifica se tem itens no estoque
            // Pode ser estoque.length > 0 ou verificar quantidades
            // Assumindo: Se tem registros na tabela estoque, considera válido.
            // Ou se a soma das quantidades > 0?
            // O usuário disse "nao apareça setores sem estoque".
            // Vamos considerar estoque.length > 0 (tem produtos cadastrados/disponíveis no setor)

            // CORREÇÃO: O usuário confirmou que deve aparecer mesmo com estoque zerado, desde que tenha a 'carta' (registros).
            // Antes: const temItemComQuantidade = result.data.estoque.some(item => item.quantidade_atual > 0);

            // Agora: Basta ter itens cadastrados no estoque.
            return setor;
          }
        } catch (err) {
          console.warn(`Erro ao verificar estoque do setor ${setor.nome}`, err);
        }
        return null;
      });

      const resultados = await Promise.all(promises);
      setores.value = resultados.filter((s) => s !== null);

      console.log("Setores filtrados (com ficha de estoque):", setores.value);
    }
  } catch (error) {
    console.error("Erro ao carregar setores consumidores:", error);
  } finally {
    loading.value = false;
  }
};

const navigateToSetor = (setorId) => {
  router.push(`/setores-consumidores/${setorId}`);
};

onMounted(() => {
  store.commit("setPageHeader", {
    title: "Setores Consumidores",
    subtitle: "Visualize e gerencie as unidades que recebem suprimentos.",
  });
  loadSetoresConsumidores();
});

onUnmounted(() => {
  store.commit("clearPageHeader");
});
</script>

<style scoped>
.page-content {
  /* Reduzido padding superior conforme solicitado (aprox 2rem se base 16px) */
  padding: 1.5rem 1rem 4rem 1rem;
}
</style>
