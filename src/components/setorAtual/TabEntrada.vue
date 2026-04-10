<script setup>
import { computed, inject, ref } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  PlusIcon,
  DownloadIcon,
  FileTextIcon,
  CalendarIcon,
  UserIcon,
  ArrowDownIcon,
} from "lucide-vue-next";
import ModalEntradaEstoque from "@/components/cadastros/ModalEntradaEstoque.vue";
import ModalVisualizarEntrada from "@/components/cadastros/ModalVisualizarEntrada.vue";

const emit = defineEmits(["reload-estoque"]);

const props = defineProps({
  setorId: { type: Number, required: true },
});

const store = useStore();
const user = computed(() => store.state.user || {});
const isAdmin = computed(() => {
  if (user.value.email === "admin@admin.com") return true;
  return !!user.value.is_admin;
});
const parentData = inject("setorAtualData", {
  entradasItems: [],
});

const setorAtual = computed(() => store.state.setorDetails || {});
const entradaSelecionada = ref(null);
const dialogEntradaOpen = ref(false);
const modalVisualizarEntrada = ref(null);

const listEntradas = computed(() => {
  const items =
    parentData.entradasItems?.value || parentData.entradasItems || [];
  return [...items].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
});

const formatarData = (data) => {
  if (!data) return "--/--/----";
  return new Date(data).toLocaleDateString("pt-BR");
};

const formatarHora = (data) => {
  if (!data) return "";
  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const visualizarEntrada = (entrada) => {
  entradaSelecionada.value = entrada;
  if (modalVisualizarEntrada.value) {
    modalVisualizarEntrada.value.dialogOpen = true;
  }
};

const handleEntradaRegistrada = async () => {
  const functionsEntrada = (await import("@/functions/cad_entradas")).default;
  const context = {
    $axios: axios,
    $store: store,
    entradasItems: parentData.entradasItems,
  };
  if (functionsEntrada.listByUnidade) {
    await functionsEntrada.listByUnidade(context, props.setorId);
  }
  emit("reload-estoque");
};
</script>

<template>
  <div class="flex flex-col gap-8 pb-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-end gap-6">
      <Button
        v-if="isAdmin"
        @click="dialogEntradaOpen = true"
        class="gap-2 shadow-lg shadow-primary/20"
      >
        <PlusIcon class="w-4 h-4" /> Registrar Nova Entrada
      </Button>
    </div>

    <!-- Table -->
    <Card
      v-if="listEntradas.length > 0"
      class="border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b">
            <tr>
              <th
                class="py-4 px-6 text-left font-bold text-slate-500 uppercase text-[10px]"
              >
                Protocolo
              </th>
              <th
                class="py-4 px-6 text-left font-bold text-slate-500 uppercase text-[10px]"
              >
                Data e Hora
              </th>
              <th
                class="py-4 px-6 text-left font-bold text-slate-500 uppercase text-[10px]"
              >
                Nota Fiscal
              </th>
              <th
                class="py-4 px-6 text-left font-bold text-slate-500 uppercase text-[10px]"
              >
                Fornecedor
              </th>
              <th
                class="py-4 px-6 text-center font-bold text-slate-500 uppercase text-[10px]"
              >
                Itens
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="entrada in listEntradas"
              :key="entrada.id"
              @click="visualizarEntrada(entrada)"
              class="hover:bg-slate-50/50 transition-colors cursor-pointer group"
            >
              <td class="py-4 px-6">
                <Badge
                  variant="outline"
                  class="font-black text-slate-400 border-slate-200"
                  >#{{ entrada.id }}</Badge
                >
              </td>
              <td class="py-4 px-6">
                <div class="flex flex-col">
                  <span class="font-bold text-slate-700">{{
                    formatarData(entrada.created_at)
                  }}</span>
                  <span class="text-[11px] text-slate-400 font-medium">{{
                    formatarHora(entrada.created_at)
                  }}</span>
                </div>
              </td>
              <td class="py-4 px-6 font-medium text-slate-600">
                <div class="flex items-center gap-2">
                  <FileTextIcon class="w-3.5 h-3.5 text-slate-300" />
                  {{ entrada.nota_fiscal || "N/A" }}
                </div>
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                  >
                    <UserIcon class="w-3.5 h-3.5" />
                  </div>
                  <span class="font-medium text-slate-700">{{
                    entrada.fornecedor?.razao_social_nome ||
                    "Fornecedor Externo"
                  }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-center">
                <div
                  class="inline-flex h-6 px-2 items-center justify-center rounded-full bg-primary/10 text-primary font-black text-[10px]"
                >
                  {{ entrada.itens?.length || 0 }} SKU
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl"
    >
      <div class="p-6 bg-white rounded-full shadow-sm mb-4">
        <ArrowDownIcon class="w-12 h-12 text-slate-300" />
      </div>
      <h3 class="text-slate-800 font-bold text-lg">Sem Entradas Externas</h3>
      <p class="text-slate-500 text-sm max-w-xs text-center mt-2">
        Nenhuma nota fiscal foi lançada diretamente para este setor até o
        momento.
      </p>
    </div>

    <!-- Modals -->
    <ModalEntradaEstoque
      v-model:open="dialogEntradaOpen"
      :unidade="{ id: setorId }"
      :setorTipo="setorAtual.tipo"
      @registrado="handleEntradaRegistrada"
    />

    <ModalVisualizarEntrada
      ref="modalVisualizarEntrada"
      :entrada="entradaSelecionada"
    />
  </div>
</template>
