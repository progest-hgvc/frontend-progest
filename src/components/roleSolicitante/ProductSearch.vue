<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <i class="mdi mdi-magnify text-xl text-blue-600"></i>
        Buscar Itens
      </h2>
      <p class="text-sm text-muted-foreground">
        Pesquise e adicione itens ao seu pedido.
      </p>
    </div>

    <!-- Seleção de Tipo de Produto e Busca -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-col md:flex-row gap-4 items-end">
          <!-- Tipo de Produto -->
          <div class="flex-shrink-0">
            <label class="text-sm font-medium mb-2 block"
              >Tipo de Produto</label
            >
            <Select v-model="tipoLocal" @update:modelValue="handleTipoChange">
              <SelectTrigger class="w-full md:w-72">
                <SelectValue placeholder="Selecione o tipo de produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Medicamento">
                  <div class="flex items-center gap-2">
                    <i class="mdi mdi-pill text-green-600"></i>
                    Medicamento
                  </div>
                </SelectItem>
                <SelectItem value="Material">
                  <div class="flex items-center gap-2">
                    <i class="mdi mdi-package-variant text-blue-600"></i>
                    Material
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Search Bar -->
          <div v-if="tipoLocal" class="flex-1 flex gap-2 items-end">
            <div class="flex-1">
              <label class="text-sm font-medium mb-2 block">Pesquisar</label>
              <Input
                type="text"
                v-model="searchQuery"
                @input="filterProducts"
                placeholder="Filtrar por nome, código..."
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              class="flex-shrink-0 h-10 w-10"
              @click="filterProducts"
            >
              <i class="mdi mdi-magnify text-lg"></i>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Loading Indicator -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Products List -->
    <div v-if="!loading" class="space-y-3">
      <div
        v-if="filteredProducts.length === 0"
        class="text-center py-8 text-muted-foreground"
      >
        <i class="mdi mdi-magnify-close text-4xl mb-2 block"></i>
        <p v-if="searchQuery">Nenhum produto encontrado para "{{ searchQuery }}".</p>
        <p v-else>Nenhum produto disponível para este tipo.</p>
      </div>

      <Card
        v-for="product in filteredProducts"
        :key="product.id"
        class="transition-all duration-300 ease-in-out hover:shadow-md"
      >
        <CardContent class="py-3 px-4">
          <div class="flex items-center justify-between gap-4">
            <!-- Product Info -->
            <div class="flex-1 min-w-0 flex items-center gap-4">
              <!-- Title and details in same row -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                  <h3 class="font-semibold text-base truncate">
                    {{ product.nome }}
                  </h3>
                  <div
                    class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span v-if="product.marca" class="flex items-center gap-1">
                      <i class="mdi mdi-tag-outline"></i>
                      {{ product.marca }}
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="mdi mdi-scale"></i>
                      {{ getUnidadeMedida(product) }}
                    </span>
                    <span
                      v-if="product.codigo_simpras"
                      class="flex items-center gap-1"
                    >
                      <i class="mdi mdi-barcode"></i>
                      {{ product.codigo_simpras }}
                    </span>
                    <!-- Already added indicator - inline -->
                    <Badge
                      v-if="isItemInCart(product.id)"
                      variant="secondary"
                      class="text-xs"
                    >
                      <i class="mdi mdi-check mr-1"></i>
                      {{ getItemQuantidade(product.id) }} no pedido
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quantity Input and Add Button -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <Input
                type="number"
                v-model.number="quantidades[product.id]"
                :min="1"
                placeholder="Qtd"
                class="w-16 text-center h-9"
              />
              <Button
                size="icon"
                @click="handleAddItem(product)"
                :disabled="
                  !quantidades[product.id] || quantidades[product.id] <= 0
                "
                class="h-9 w-9"
              >
                <i class="mdi mdi-plus"></i>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Load More -->
      <div
        v-if="hasMoreProducts && filteredProducts.length > 0"
        class="text-center py-4"
      >
        <Button
          variant="outline"
          @click="loadMoreProducts"
          :disabled="loadingMore"
        >
          <LoadingSpinner v-if="loadingMore" size="sm" class="mr-2" />
          {{ loadingMore ? "Carregando..." : "Carregar mais" }}
        </Button>
      </div>
    </div>

    <!-- Floating Cart Summary -->
    <div
      v-if="quantidadeProdutos > 0"
      class="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4"
    >
      <Button
        @click="goToCheckout"
        class="shadow-lg flex items-center gap-2 px-6 py-3"
        size="lg"
      >
        <i class="mdi mdi-cart"></i>
        Ver Pedido ({{ quantidadeProdutos }}
        {{ quantidadeProdutos === 1 ? "item" : "itens" }})
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingSpinner from "@/components/ui/loading-spinner/LoadingSpinner.vue";
import { useToast } from "@/components/ui/toast";
import { useSolicitacao } from "@/composables/useSolicitacao";
const router = useRouter();
const { toast } = useToast();

const { tipo, itens, quantidadeProdutos, setTipo, addItem } = useSolicitacao();

const tipoLocal = ref(tipo.value || "Medicamento");
const searchQuery = ref("");
const products = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const currentPage = ref(1);
const hasMoreProducts = ref(false);
const quantidades = ref({});

// Sync tipoLocal com o composable
watch(tipo, (newVal) => {
  tipoLocal.value = newVal;
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  const query = searchQuery.value.toLowerCase();
  return products.value.filter(
    (p) =>
      p.nome?.toLowerCase().includes(query) ||
      p.marca?.toLowerCase().includes(query) ||
      p.codigo_simpras?.toLowerCase().includes(query)
  );
});

const getUnidadeMedida = (product) => {
  return product.unidade_medida?.sigla || product.unidade_medida?.nome || "UN";
};

const isItemInCart = (productId) => {
  return itens.value.some((item) => item.produtoId === productId);
};

const getItemQuantidade = (productId) => {
  const item = itens.value.find((i) => i.produtoId === productId);
  return item ? item.quantidade : 0;
};

const handleTipoChange = async (newTipo) => {
  if (tipo.value && tipo.value !== newTipo && itens.value.length > 0) {
    const confirm = window.confirm(
      "Ao trocar o tipo de produto, os itens do pedido serão removidos. Deseja continuar?"
    );
    if (!confirm) {
      tipoLocal.value = tipo.value;
      return;
    }
  }

  setTipo(newTipo);
  searchQuery.value = "";
  currentPage.value = 1;
  await fetchProducts();
};

const fetchProducts = async () => {
  if (!tipoLocal.value) {
    products.value = [];
    return;
  }

  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "/produtos/list",
      {
        filters: { tipo_produto: tipoLocal.value, status: "A" },
        sort_by: "nome",
        sort_dir: "asc",
        per_page: 50,
        page: currentPage.value,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.status) {
      const data = response.data.data;
      const lista = Array.isArray(data) ? data : data.data || [];
      if (currentPage.value === 1) {
        products.value = lista;
      } else {
        products.value = [...products.value, ...lista];
      }
      hasMoreProducts.value = !Array.isArray(data) && data.current_page < data.last_page;
    }
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar os produtos.",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
};

const loadMoreProducts = async () => {
  loadingMore.value = true;
  currentPage.value++;
  await fetchProducts();
  loadingMore.value = false;
};

const filterProducts = () => {
  // A filtragem é feita via computed property
};

const handleAddItem = (product) => {
  const quantidade = quantidades.value[product.id];
  if (!quantidade || quantidade <= 0) return;

  addItem(product, quantidade);
  quantidades.value[product.id] = null;

  toast({
    title: "Item adicionado",
    description: `${product.nome} (${quantidade}) adicionado ao pedido.`,
  });
};

const goToCheckout = () => {
  router.push("/itens?tab=pedido");
};

onMounted(() => {
  if (tipo.value) {
    tipoLocal.value = tipo.value;
  } else {
    setTipo("Medicamento");
  }
  fetchProducts();
});
</script>
