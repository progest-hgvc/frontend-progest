<script setup>
import { ref, computed, inject } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeftRightIcon,
  PlusIcon,
  EyeIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  FileTextIcon,
  AlertCircleIcon,
  TruckIcon,
} from "lucide-vue-next";
import ModalNovaMovimentacao from "@/components/cadastros/ModalNovaMovimentacao.vue";
import { useToast } from "@/components/ui/toast/use-toast";

const props = defineProps({
  setorId: { type: Number, required: true },
});

const store = useStore();
const { toast } = useToast();

const parentData = inject("setorAtualData", {
  movimentacoesItems: [],
});

const dialogMovimentacaoOpen = ref(false);
const dialogDetalhesOpen = ref(false);
const dialogAprovacaoOpen = ref(false);
const movimentacaoSelecionada = ref(null);
const movimentacaoParaAprovar = ref(null);
const itensParaAprovacao = ref([]);
const loadingAprovacao = ref(false);
const dialogCancelamentoOpen = ref(false);
const movimentacaoParaCancelar = ref(null);
const loadingCancelamento = ref(false);
const previewLotesData = ref([]);

// Filters
const filterTipo = ref("todos");
const filterStatus = ref("todos");
const filterSearch = ref("");

const listMovimentacoes = computed(
  () =>
    parentData.movimentacoesItems?.value || parentData.movimentacoesItems || [],
);

const filteredMovimentacoes = computed(() => {
  let items = [...listMovimentacoes.value];
  if (filterTipo.value !== "todos") {
    items = items.filter((mov) =>
      filterTipo.value === "entrada" ? isEntrada(mov) : isSaida(mov),
    );
  }
  if (filterStatus.value !== "todos") {
    items = items.filter(
      (mov) => mov.status_solicitacao === filterStatus.value,
    );
  }
  if (filterSearch.value.trim()) {
    const term = filterSearch.value.toLowerCase();
    items = items.filter((mov) => {
      const orig = (
        mov.setor_origem?.nome ||
        mov.setorOrigem?.nome ||
        ""
      ).toLowerCase();
      const dest = (
        mov.setor_destino?.nome ||
        mov.setorDestino?.nome ||
        ""
      ).toLowerCase();
      return orig.includes(term) || dest.includes(term);
    });
  }
  return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const isEntrada = (mov) =>
  mov.setor_destino_id === props.setorId ||
  mov.setorDestino?.id === props.setorId;
const isSaida = (mov) =>
  mov.setor_origem_id === props.setorId ||
  mov.setorOrigem?.id === props.setorId;

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

const getStatusBadge = (status) => {
  const map = {
    A: { label: "Aprovada", variant: "success" },
    R: { label: "Rejeitada", variant: "destructive" },
    P: { label: "Pendente", variant: "warning" },
    C: { label: "Rascunho", variant: "secondary" },
    X: { label: "Cancelada", variant: "outline" },
  };
  return map[status] || { label: status, variant: "default" };
};

const verDetalhes = (mov) => {
  movimentacaoSelecionada.value = mov;
  dialogDetalhesOpen.value = true;
};

const abrirModalAprovacao = async (mov) => {
  movimentacaoParaAprovar.value = mov;
  previewLotesData.value = [];
  loadingAprovacao.value = true;
  try {
    const authHeader = { Authorization: "Bearer " + store.getters.getUserToken };
    const [estoqueResponse, previewResponse] = await Promise.allSettled([
      axios.get(`/estoque/setor/${props.setorId}`, { headers: authHeader }),
      axios.get(`/movimentacao/${mov.id}/preview-lotes`, { headers: authHeader }),
    ]);

    let estoqueMap = {};
    if (estoqueResponse.status === "fulfilled" && estoqueResponse.value.data.success && estoqueResponse.value.data.data.estoque) {
      estoqueResponse.value.data.data.estoque.forEach((e) => {
        estoqueMap[e.produto?.id || e.produto_id] = e.quantidade_atual;
      });
    }

    if (previewResponse.status === "fulfilled" && previewResponse.value.data.status) {
      previewLotesData.value = previewResponse.value.data.data || [];
    }

    itensParaAprovacao.value = (mov.itens || []).map((item) => ({
      ...item,
      quantidade_liberada:
        item.quantidade_liberada ?? item.quantidade_solicitada,
      estoque_atual: estoqueMap[item.produto?.id || item.produto_id] || 0,
    }));
    dialogAprovacaoOpen.value = true;
  } catch (e) {
    toast({
      title: "Erro",
      description: "Não foi possível carregar o estoque para validação.",
      variant: "destructive",
    });
  } finally {
    loadingAprovacao.value = false;
  }
};

const aprovarMovimentacao = async () => {
  loadingAprovacao.value = true;
  try {
    const payload = {
      status: "A",
      itens: itensParaAprovacao.value.map((it) => ({
        id: it.id,
        quantidade_liberada: it.quantidade_liberada,
      })),
    };
    await axios.post(
      `/movimentacao/${movimentacaoParaAprovar.value.id}/process`,
      payload,
      {
        headers: { Authorization: "Bearer " + store.getters.getUserToken },
      },
    );
    toast({
      title: "Sucesso",
      description: "Movimentação aprovada com sucesso.",
    });
    dialogAprovacaoOpen.value = false;
    location.reload(); // Simples reload para atualizar estado global
  } catch (e) {
    toast({
      title: "Erro",
      description: "Falha ao aprovar movimentação.",
      variant: "destructive",
    });
  } finally {
    loadingAprovacao.value = false;
  }
};

const rejeitarMovimentacao = async () => {
  loadingAprovacao.value = true;
  try {
    await axios.post(
      `/movimentacao/${movimentacaoParaAprovar.value.id}/process`,
      { status: "R" },
      {
        headers: { Authorization: "Bearer " + store.getters.getUserToken },
      },
    );
    toast({ title: "Sucesso", description: "Movimentação rejeitada." });
    dialogAprovacaoOpen.value = false;
    location.reload();
  } catch (e) {
    toast({
      title: "Erro",
      description: "Falha ao rejeitar.",
      variant: "destructive",
    });
  } finally {
    loadingAprovacao.value = false;
  }
};

const confirmarCancelamento = (mov) => {
  movimentacaoParaCancelar.value = mov;
  dialogCancelamentoOpen.value = true;
};

const cancelarMovimentacao = async () => {
  loadingCancelamento.value = true;
  try {
    await axios.post(
      `/movimentacao/${movimentacaoParaCancelar.value.id}/process`,
      { status: "X" },
      {
        headers: { Authorization: "Bearer " + store.getters.getUserToken },
      },
    );
    toast({ title: "Sucesso", description: "Solicitação cancelada." });
    dialogCancelamentoOpen.value = false;
    location.reload();
  } catch (e) {
    toast({
      title: "Erro",
      description: "Falha ao cancelar.",
      variant: "destructive",
    });
  } finally {
    loadingCancelamento.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-8 pb-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-end gap-6">
      <Button
        @click="dialogMovimentacaoOpen = true"
        class="gap-2 shadow-lg shadow-primary/20"
      >
        <PlusIcon class="w-4 h-4" /> Nova Requisição
      </Button>
    </div>

    <!-- Filters -->
    <Card class="border-slate-200 shadow-sm bg-slate-50/50">
      <CardContent class="p-4 flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <Label class="text-[10px] font-bold uppercase text-slate-400"
            >Tipo</Label
          >
          <Select v-model="filterTipo">
            <SelectTrigger class="w-[120px] h-9 bg-white"
              ><SelectValue
            /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="saida">Saídas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex items-center gap-2">
          <Label class="text-[10px] font-bold uppercase text-slate-400"
            >Status</Label
          >
          <Select v-model="filterStatus">
            <SelectTrigger class="w-[140px] h-9 bg-white"
              ><SelectValue
            /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="P">Pendente</SelectItem>
              <SelectItem value="A">Aprovada</SelectItem>
              <SelectItem value="R">Rejeitada</SelectItem>
              <SelectItem value="C">Rascunho</SelectItem>
              <SelectItem value="X">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex-1 min-w-[200px] relative">
          <Input
            v-model="filterSearch"
            placeholder="Buscar unidade..."
            class="px-4 h-9 bg-white"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Table -->
    <Card
      v-if="filteredMovimentacoes.length > 0"
      class="border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b">
            <tr>
              <th
                class="py-4 px-6 text-left font-bold text-slate-500 uppercase text-[10px]"
              >
                Fluxo
              </th>
              <th
                class="py-4 px-6 text-left font-bold text-slate-500 uppercase text-[10px]"
              >
                Data/Hora
              </th>
              <th
                class="py-4 px-6 text-left font-bold text-slate-500 uppercase text-[10px]"
              >
                Origem
              </th>
              <th
                class="py-4 px-6 text-left font-bold text-slate-500 uppercase text-[10px]"
              >
                Destino
              </th>
              <th
                class="py-4 px-6 text-center font-bold text-slate-500 uppercase text-[10px]"
              >
                Itens
              </th>
              <th
                class="py-4 px-6 text-center font-bold text-slate-500 uppercase text-[10px]"
              >
                Status
              </th>
              <th
                class="py-4 px-6 text-right font-bold text-slate-500 uppercase text-[10px]"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="mov in filteredMovimentacoes"
              :key="mov.id"
              class="hover:bg-slate-50/50 transition-colors group"
            >
              <td class="py-4 px-6">
                <div
                  v-if="isEntrada(mov)"
                  class="flex items-center gap-2 text-emerald-600 font-bold"
                >
                  <ArrowDownCircleIcon class="w-5 h-5" />
                  <span class="text-[11px] uppercase">Entrada</span>
                </div>
                <div
                  v-else
                  class="flex items-center gap-2 text-blue-600 font-bold"
                >
                  <ArrowUpCircleIcon class="w-5 h-5" />
                  <span class="text-[11px] uppercase">Saída</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <div class="flex flex-col">
                  <span class="font-bold text-slate-700">{{
                    formatarData(mov.created_at)
                  }}</span>
                  <span
                    class="text-[11px] text-slate-400 flex items-center gap-1"
                    ><ClockIcon class="w-3 h-3" />
                    {{ formatarHora(mov.created_at) }}</span
                  >
                </div>
              </td>
              <td
                class="py-4 px-6 font-medium"
                :class="
                  isSaida(mov)
                    ? 'text-slate-900 underline decoration-primary/30'
                    : 'text-slate-500'
                "
              >
                {{ mov.setor_origem?.nome || mov.setorOrigem?.nome || "-" }}
              </td>
              <td
                class="py-4 px-6 font-medium"
                :class="
                  isEntrada(mov)
                    ? 'text-slate-900 underline decoration-primary/30'
                    : 'text-slate-500'
                "
              >
                {{ mov.setor_destino?.nome || mov.setorDestino?.nome || "-" }}
              </td>
              <td class="py-4 px-6 text-center">
                <Badge variant="outline" class="font-black bg-white">{{
                  mov.itens?.length || 0
                }}</Badge>
              </td>
              <td class="py-4 px-6 text-center">
                <Badge
                  :variant="getStatusBadge(mov.status_solicitacao).variant"
                  class="text-[10px] font-black uppercase tracking-tight"
                >
                  {{ getStatusBadge(mov.status_solicitacao).label }}
                </Badge>
              </td>
              <td class="py-4 px-6 text-right space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  @click="verDetalhes(mov)"
                  class="h-8 w-8 text-slate-400 hover:text-primary"
                >
                  <EyeIcon class="w-4 h-4" />
                </Button>

                <Button
                  v-if="isSaida(mov) && mov.status_solicitacao === 'P'"
                  variant="ghost"
                  size="icon"
                  @click="abrirModalAprovacao(mov)"
                  class="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                >
                  <CheckCircle2Icon class="w-4 h-4" />
                </Button>

                <Button
                  v-if="isEntrada(mov) && mov.status_solicitacao === 'P'"
                  variant="ghost"
                  size="icon"
                  @click="confirmarCancelamento(mov)"
                  class="h-8 w-8 text-destructive hover:bg-destructive/10"
                >
                  <XCircleIcon class="w-4 h-4" />
                </Button>
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
        <ArrowLeftRightIcon class="w-12 h-12 text-slate-300" />
      </div>
      <h3 class="text-slate-800 font-bold text-lg">Sem Movimentações</h3>
      <p class="text-slate-500 text-sm max-w-xs text-center mt-2">
        Nenhum registro de transferência foi encontrado para este período ou
        filtros.
      </p>
    </div>

    <!-- Modals -->
    <ModalNovaMovimentacao
      v-model:open="dialogMovimentacaoOpen"
      :setorId="setorId"
    />

    <!-- Details View -->
    <Dialog v-model:open="dialogDetalhesOpen">
      <DialogContent
        class="max-w-3xl border-none p-0 overflow-hidden bg-slate-50"
      >
        <div class="bg-primary p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <h2 class="text-xl font-black uppercase tracking-tighter">
                Detalhes da Movimentação
              </h2>
              <p
                class="text-primary-foreground/80 text-xs flex items-center gap-1 font-bold"
              >
                #{{ movimentacaoSelecionada?.id }} •
                {{ formatarData(movimentacaoSelecionada?.created_at) }}
              </p>
            </div>
            <Badge
              variant="outline"
              class="bg-white/20 text-white border-white/40 font-black"
            >
              {{
                getStatusBadge(movimentacaoSelecionada?.status_solicitacao)
                  .label
              }}
            </Badge>
          </div>
        </div>

        <div class="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4 p-4 bg-white rounded-2xl border shadow-sm">
              <div
                class="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
              >
                <ArrowUpCircleIcon class="w-4 h-4" /> Origem / Fornecedor
              </div>
              <div class="space-y-1">
                <p class="text-lg font-black text-slate-900 leading-tight">
                  {{ movimentacaoSelecionada?.setor_origem?.nome || "-" }}
                </p>
                <p class="text-xs text-slate-500 flex items-center gap-1">
                  <UserIcon class="w-3 h-3" /> Responsável pela Unidade
                </p>
              </div>
            </div>

            <div
              class="space-y-4 p-4 bg-white rounded-2xl border shadow-sm border-emerald-100"
            >
              <div
                class="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest"
              >
                <ArrowDownCircleIcon class="w-4 h-4" /> Destino / Solicitante
              </div>
              <div class="space-y-1">
                <p class="text-lg font-black text-slate-900 leading-tight">
                  {{ movimentacaoSelecionada?.setor_destino?.nome || "-" }}
                </p>
                <p class="text-xs text-slate-500 flex items-center gap-1">
                  <UserIcon class="w-3 h-3" /> Solicitado por:
                  {{ movimentacaoSelecionada?.usuario?.name || "N/A" }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="movimentacaoSelecionada?.observacao"
            class="p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-amber-800 text-sm"
          >
            <p class="font-bold flex items-center gap-2 mb-1">
              <FileTextIcon class="w-4 h-4" /> Notas do Solicitante:
            </p>
            "{{ movimentacaoSelecionada?.observacao }}"
          </div>

          <div class="space-y-4">
            <h3
              class="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"
            >
              <FileTextIcon class="w-4 h-4" /> Itens Solicitados
            </h3>
            <div class="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b">
                  <tr>
                    <th
                      class="py-3 px-6 text-left font-bold text-slate-400 text-[10px]"
                    >
                      Item
                    </th>
                    <th
                      class="py-3 px-6 text-center font-bold text-slate-400 text-[10px]"
                    >
                      Solicitada
                    </th>
                    <th
                      class="py-3 px-6 text-center font-bold text-slate-400 text-[10px]"
                    >
                      Liberada
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr
                    v-for="item in movimentacaoSelecionada?.itens"
                    :key="item.id"
                  >
                    <td class="py-4 px-6 font-bold text-slate-700">
                      {{ item.produto?.nome || "-" }}
                    </td>
                    <td class="py-4 px-6 text-center">
                      <Badge variant="secondary" class="font-black">{{
                        item.quantidade_solicitada
                      }}</Badge>
                    </td>
                    <td class="py-4 px-6 text-center">
                      <Badge
                        v-if="item.quantidade_liberada"
                        variant="success"
                        class="font-black"
                        >{{ item.quantidade_liberada }}</Badge
                      >
                      <span
                        v-else
                        class="text-slate-300 font-bold italic text-xs"
                        >Aguardando</span
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Approval/Review View -->
    <Dialog v-model:open="dialogAprovacaoOpen">
      <DialogContent
        class="max-w-4xl border-none p-0 overflow-hidden bg-slate-50"
      >
        <div class="bg-emerald-600 p-6 text-white">
          <h2 class="text-xl font-black uppercase tracking-tighter">
            Análise de Solicitação
          </h2>
          <p class="text-emerald-100/80 text-xs font-bold">
            Unidade: {{ setorNome }}
          </p>
        </div>

        <div class="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <!-- Flow Viz -->
          <div
            class="flex items-center justify-between p-6 bg-white rounded-3xl border shadow-sm"
          >
            <div class="text-center space-y-2">
              <div
                class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400"
              >
                <TruckIcon class="w-6 h-6" />
              </div>
              <p class="text-[10px] font-black uppercase text-slate-400">
                Origem (Você)
              </p>
              <p class="text-sm font-bold">{{ setorNome }}</p>
            </div>
            <div class="flex-1 flex flex-col items-center gap-1 mx-4">
              <div class="h-[2px] w-full bg-slate-100 relative">
                <div
                  class="absolute right-0 -top-1 border-y-4 border-l-8 border-y-transparent border-l-slate-200"
                ></div>
              </div>
              <Badge
                variant="outline"
                class="text-[9px] font-black bg-white uppercase"
                >Pendente</Badge
              >
            </div>
            <div class="text-center space-y-2">
              <div
                class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 font-black tracking-tighter text-xs"
              >
                DEST
              </div>
              <p class="text-[10px] font-black uppercase text-emerald-500">
                Destino
              </p>
              <p class="text-sm font-bold text-emerald-900">
                {{ movimentacaoParaAprovar?.setor_destino?.nome || "-" }}
              </p>
            </div>
          </div>

          <!-- Items Review Table -->
          <div class="space-y-4">
            <h3
              class="text-xs font-black uppercase text-slate-400 tracking-widest px-1"
            >
              Conferência de Itens e Estoque
            </h3>
            <div class="bg-white border rounded-3xl overflow-hidden shadow-sm">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b">
                  <tr>
                    <th
                      class="py-3 px-6 text-left font-bold text-slate-400 text-[10px]"
                    >
                      Produto
                    </th>
                    <th
                      class="py-3 px-6 text-center font-bold text-slate-400 text-[10px]"
                    >
                      Solicitada
                    </th>
                    <th
                      class="py-3 px-6 text-center font-bold text-slate-400 text-[10px]"
                    >
                      Seu Estoque
                    </th>
                    <th
                      class="py-3 px-6 text-center font-bold text-slate-400 text-[10px] w-32"
                    >
                      Liberar
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr
                    v-for="(item, idx) in itensParaAprovacao"
                    :key="idx"
                    :class="
                      item.quantidade_liberada > item.estoque_atual
                        ? 'bg-red-50/50'
                        : ''
                    "
                  >
                    <td class="py-4 px-6 font-bold text-slate-800">
                      {{ item.produto?.nome || item.produtoNome || "-" }}
                    </td>
                    <td class="py-4 px-6 text-center font-black text-slate-500">
                      {{ item.quantidade_solicitada }}
                    </td>
                    <td class="py-4 px-6 text-center">
                      <Badge
                        :variant="
                          item.estoque_atual > 0 ? 'secondary' : 'destructive'
                        "
                        class="font-black"
                        >{{ item.estoque_atual }}</Badge
                      >
                    </td>
                    <td class="py-4 px-6">
                      <div class="relative">
                        <Input
                          type="number"
                          v-model.number="item.quantidade_liberada"
                          class="h-9 font-black text-center pr-2"
                          :class="
                            item.quantidade_liberada > item.estoque_atual
                              ? 'border-red-500 text-red-600 bg-red-50'
                              : 'border-emerald-200 focus:ring-emerald-500'
                          "
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Validation Errors -->
          <div
            v-if="
              itensParaAprovacao.some(
                (it) => it.quantidade_liberada > it.estoque_atual,
              )
            "
            class="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3"
          >
            <AlertCircleIcon class="w-5 h-5 text-red-600 shrink-0" />
            <div class="space-y-1">
              <p class="text-sm font-black text-red-900 leading-none">
                Erro de Disponibilidade
              </p>
              <p class="text-xs text-red-700">
                Alguns itens possuem quantidade a liberar superior ao seu
                estoque atual. Ajuste os valores antes de prosseguir.
              </p>
            </div>
          </div>

          <!-- Lot Preview (FIFO) -->
          <div v-if="previewLotesData.length > 0" class="space-y-3">
            <h3
              class="text-xs font-black uppercase text-slate-400 tracking-widest px-1 flex items-center gap-2"
            >
              <CalendarIcon class="w-4 h-4" /> Lotes que serão consumidos (FIFO — mais antigo primeiro)
            </h3>

            <!-- No-coverage warning -->
            <div
              v-if="previewLotesData.some((p) => p.quantidade_sem_cobertura > 0)"
              class="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3"
            >
              <AlertCircleIcon class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div class="space-y-1">
                <p class="text-sm font-black text-amber-900 leading-none">
                  Cobertura insuficiente em lotes
                </p>
                <p class="text-xs text-amber-800">
                  Alguns produtos não possuem saldo suficiente registrado em
                  lotes para cobrir a quantidade solicitada. O estoque agregado
                  será deduzido, mas verifique a consistência dos lotes.
                </p>
              </div>
            </div>

            <div
              v-for="preview in previewLotesData"
              :key="preview.produto_id"
              class="bg-white border rounded-2xl overflow-hidden shadow-sm"
            >
              <div class="px-5 py-3 bg-slate-50 border-b flex items-center justify-between">
                <p class="text-xs font-black text-slate-700 uppercase tracking-wide">
                  {{ preview.produto_nome }}
                </p>
                <Badge
                  v-if="preview.quantidade_sem_cobertura > 0"
                  variant="warning"
                  class="text-[9px] font-black"
                >
                  Sem cobertura: {{ preview.quantidade_sem_cobertura }}
                </Badge>
              </div>
              <table class="w-full text-xs">
                <thead class="bg-slate-50/60 border-b">
                  <tr>
                    <th class="py-2 px-5 text-left font-bold text-slate-400 text-[10px]">Lote</th>
                    <th class="py-2 px-5 text-center font-bold text-slate-400 text-[10px]">Vencimento</th>
                    <th class="py-2 px-5 text-center font-bold text-slate-400 text-[10px]">Qtd disponível</th>
                    <th class="py-2 px-5 text-center font-bold text-slate-400 text-[10px]">Qtd a usar</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr
                    v-for="lote in preview.lotes_a_consumir"
                    :key="lote.lote_id"
                    class="hover:bg-slate-50/50"
                  >
                    <td class="py-3 px-5 font-bold text-slate-800">{{ lote.lote || "—" }}</td>
                    <td class="py-3 px-5 text-center text-slate-600">
                      {{ lote.data_vencimento ? new Date(lote.data_vencimento).toLocaleDateString('pt-BR') : "—" }}
                    </td>
                    <td class="py-3 px-5 text-center">
                      <Badge variant="secondary" class="font-black text-[10px]">{{ lote.quantidade_disponivel }}</Badge>
                    </td>
                    <td class="py-3 px-5 text-center">
                      <Badge class="font-black text-[10px] bg-emerald-100 text-emerald-800 border-emerald-200">{{ lote.quantidade_a_usar }}</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter
          class="p-6 bg-white border-t flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="ghost"
            class="text-destructive font-bold hover:bg-destructive/5"
            @click="rejeitarMovimentacao"
            :disabled="loadingAprovacao"
          >
            Rejeitar Integramente
          </Button>
          <div class="flex gap-2">
            <Button
              variant="outline"
              @click="dialogAprovacaoOpen = false"
              :disabled="loadingAprovacao"
              >Cancelar</Button
            >
            <Button
              class="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 gap-2 font-black"
              @click="aprovarMovimentacao"
              :disabled="
                loadingAprovacao ||
                itensParaAprovacao.some(
                  (it) => it.quantidade_liberada > it.estoque_atual,
                ) ||
                itensParaAprovacao.every((it) => it.quantidade_liberada <= 0)
              "
            >
              <CheckCircle2Icon v-if="!loadingAprovacao" class="w-4 h-4" />
              {{ loadingAprovacao ? "Processando..." : "Confirmar Liberação" }}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Cancel Dialog -->
    <Dialog v-model:open="dialogCancelamentoOpen">
      <DialogContent
        class="max-w-md border-none p-0 overflow-hidden rounded-3xl"
      >
        <div class="p-8 space-y-6 text-center">
          <div
            class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2 text-red-600"
          >
            <AlertCircleIcon class="w-10 h-10" />
          </div>
          <div class="space-y-2">
            <h2 class="text-xl font-black text-slate-900">
              Cancelar Solicitação?
            </h2>
            <p class="text-sm text-slate-500 leading-relaxed px-4">
              Esta ação irá invalidar a requisição #{{
                movimentacaoParaCancelar?.id
              }}
              e notificará o setor de origem.
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <Button
              variant="destructive"
              class="h-12 text-sm font-black uppercase tracking-widest shadow-lg shadow-red-200"
              @click="cancelarMovimentacao"
              :disabled="loadingCancelamento"
            >
              {{
                loadingCancelamento
                  ? "Cancelando..."
                  : "Sim, Confirmar Cancelamento"
              }}
            </Button>
            <Button
              variant="ghost"
              class="h-12 font-bold text-slate-400"
              @click="dialogCancelamentoOpen = false"
              :disabled="loadingCancelamento"
              >Voltar</Button
            >
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
