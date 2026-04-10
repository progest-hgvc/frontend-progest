<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <i class="mdi mdi-history text-xl text-blue-600"></i>
        Histórico de Pedidos
      </h2>
      <p class="text-sm text-muted-foreground">
        Acompanhe o status dos seus pedidos anteriores.
      </p>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="w-full min-h-[400px] flex items-center justify-center"
    >
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <Card v-else-if="pedidos.length === 0">
      <CardContent class="py-12 text-center">
        <i
          class="mdi mdi-package-variant text-6xl text-muted-foreground mb-4"
        ></i>
        <h3 class="text-lg font-medium mb-2">Nenhum pedido encontrado</h3>
        <p class="text-muted-foreground mb-4">
          Você ainda não fez nenhum pedido.
        </p>
        <Button @click="irParaBuscar">
          <i class="mdi mdi-magnify mr-2"></i>
          Buscar Itens
        </Button>
      </CardContent>
    </Card>

    <!-- Pedidos List -->
    <div v-else class="space-y-4">
      <Card v-for="pedido in pedidos" :key="pedido.id" class="overflow-hidden">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <CardTitle class="text-lg">Pedido #{{ pedido.id }}</CardTitle>
              <Badge :variant="getStatusVariant(pedido.status_solicitacao)">
                {{ getStatusLabel(pedido.status_solicitacao) }}
              </Badge>
            </div>
            <div class="text-sm text-muted-foreground">
              {{ formatDate(pedido.data_hora) }}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <!-- Info do pedido e Ações -->
            <div class="flex items-center justify-between">
              <div class="flex flex-wrap gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <i class="mdi mdi-store text-muted-foreground"></i>
                  <span class="text-muted-foreground">Fornecedor:</span>
                  <span class="font-medium">
                    {{ pedido.setor_origem?.nome || "N/A" }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="mdi mdi-package-variant text-muted-foreground"></i>
                  <span class="text-muted-foreground">Itens:</span>
                  <span class="font-medium">
                    {{ pedido.itens?.length || 0 }}
                  </span>
                </div>
              </div>

              <!-- Botões de Ação -->
              <div class="flex items-center gap-2">
                <!-- Botão de Imprimir -->
                <Button
                  v-if="pedido.status_solicitacao === 'A'"
                  variant="ghost"
                  size="icon"
                  @click.stop="imprimirPedido(pedido)"
                  class="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title="Imprimir Pedido"
                >
                  <i class="mdi mdi-printer text-xl"></i>
                </Button>

                <!-- Botão de Cancelar -->
                <Button
                  v-if="pedido.status_solicitacao === 'P'"
                  variant="ghost"
                  size="icon"
                  @click.stop="cancelarPedido(pedido)"
                  :disabled="canceling === pedido.id"
                  class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Cancelar Pedido"
                >
                  <LoadingSpinner v-if="canceling === pedido.id" size="sm" />
                  <i v-else class="mdi mdi-close-circle-outline text-xl"></i>
                </Button>
              </div>
            </div>

            <!-- Observação -->
            <div v-if="pedido.observacao" class="text-sm">
              <span class="text-muted-foreground">Observação:</span>
              <span class="ml-2">{{ pedido.observacao }}</span>
            </div>

            <!-- Expandir detalhes -->
            <div class="pt-2">
              <Button
                variant="ghost"
                size="sm"
                @click="toggleExpand(pedido.id)"
                class="text-xs"
              >
                <i
                  :class="[
                    'mdi mr-1',
                    expanded[pedido.id] ? 'mdi-chevron-up' : 'mdi-chevron-down',
                  ]"
                ></i>
                {{ expanded[pedido.id] ? "Ocultar itens" : "Ver itens" }}
              </Button>
            </div>

            <!-- Itens expandidos -->
            <div
              v-if="expanded[pedido.id] && pedido.itens"
              class="border-t pt-3 mt-2"
            >
              <div class="space-y-2">
                <div
                  v-for="item in pedido.itens"
                  :key="item.id"
                  class="flex items-center justify-between text-sm p-2 bg-muted rounded"
                >
                  <div>
                    <span class="font-medium">
                      {{ item.produto?.nome || `Produto #${item.produto_id}` }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-muted-foreground">
                      Solicitado: {{ item.quantidade_solicitada }}
                    </span>
                    <span
                      v-if="item.quantidade_liberada > 0"
                      class="text-green-600"
                    >
                      Liberado: {{ item.quantidade_liberada }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Alert Dialog para confirmar cancelamento -->
    <AlertDialog v-model:open="showCancelDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja realmente cancelar o Pedido #{{ pedidoParaCancelar?.id }}?
            Esta ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Não, manter pedido</AlertDialogCancel>
          <AlertDialogAction
            @click="confirmarCancelamento"
            class="bg-red-600 hover:bg-red-700 text-white"
          >
            Sim, cancelar pedido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading-spinner/LoadingSpinner.vue";
import { useToast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const router = useRouter();
const store = useStore();
const { toast } = useToast();

const pedidos = ref([]);
const loading = ref(true);
const expanded = ref({});
const canceling = ref(null);
const showCancelDialog = ref(false);
const pedidoParaCancelar = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusLabel = (status) => {
  const labels = {
    P: "Pendente",
    A: "Aprovado",
    R: "Rejeitado",
    C: "Rascunho",
    X: "Cancelado",
  };
  return labels[status] || status;
};

const getStatusVariant = (status) => {
  const variants = {
    P: "secondary",
    A: "default",
    R: "destructive",
    C: "outline",
    X: "destructive",
  };
  return variants[status] || "secondary";
};

const toggleExpand = (pedidoId) => {
  expanded.value[pedidoId] = !expanded.value[pedidoId];
};

const fetchPedidos = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    const setorId = store.state.setorAtualId;

    const response = await axios.post(
      "/movimentacao/listBySetor",
      { setor_id: setorId, per_page: 50 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.status) {
      // Filtrar apenas solicitações onde o setor atual é o destino
      const data = response.data.data?.data || response.data.data || [];
      pedidos.value = data.filter(
        (mov) => mov.tipo === "S" && mov.setor_destino_id === Number(setorId)
      );
    }
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar o histórico.",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
};

const cancelarPedido = (pedido) => {
  pedidoParaCancelar.value = pedido;
  showCancelDialog.value = true;
};

const confirmarCancelamento = async () => {
  const pedido = pedidoParaCancelar.value;
  if (!pedido) return;

  showCancelDialog.value = false;
  canceling.value = pedido.id;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `/movimentacao/${pedido.id}/process`,
      { action: "cancel" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.status) {
      toast({
        title: "Sucesso",
        description: "Pedido cancelado com sucesso.",
      });
      await fetchPedidos();
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    toast({
      title: "Erro",
      description:
        error.response?.data?.message || "Não foi possível cancelar o pedido.",
      variant: "destructive",
    });
  } finally {
    canceling.value = null;
    pedidoParaCancelar.value = null;
  }
};

const imprimirPedido = (pedido) => {
  // Obter informações do usuário e setor atual
  const user = store.state.user;
  const setorAtual = store.state.setorDetails;

  // Criar janela de impressão
  const printWindow = window.open("", "_blank");
  
  if (!printWindow) {
    toast({
      title: "Erro",
      description: "Não foi possível abrir a janela de impressão. Verifique se pop-ups estão bloqueados.",
      variant: "destructive",
    });
    return;
  }

  // Gerar HTML do pedido
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pedido #${pedido.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          color: #333;
          line-height: 1.6;
        }

        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .header h1 {
          color: #2563eb;
          font-size: 28px;
          margin-bottom: 5px;
        }

        .header .subtitle {
          color: #64748b;
          font-size: 14px;
        }

        .info-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed #e2e8f0;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 600;
          color: #475569;
          min-width: 150px;
        }

        .info-value {
          color: #1e293b;
          text-align: right;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-P { background: #fef3c7; color: #92400e; }
        .status-A { background: #d1fae5; color: #065f46; }
        .status-R { background: #fee2e2; color: #991b1b; }
        .status-C { background: #f3f4f6; color: #374151; }
        .status-X { background: #fee2e2; color: #991b1b; }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        .items-table thead {
          background: #2563eb;
          color: white;
        }

        .items-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
        }

        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .items-table tbody tr:hover {
          background: #f8fafc;
        }

        .items-table tbody tr:last-child td {
          border-bottom: 2px solid #2563eb;
        }

        .observacao-section {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }

        .observacao-section h3 {
          color: #92400e;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }

        .signatures {
          display: flex;
          justify-content: space-around;
          margin-top: 60px;
          margin-bottom: 20px;
        }

        .signature-box {
          text-align: center;
          width: 250px;
        }

        .signature-line {
          border-top: 2px solid #333;
          margin-bottom: 8px;
          padding-top : 60px;
        }

        @media print {
          body {
            padding: 20px;
          }
          
          .no-print {
            display: none;
          }
        }

        @page {
          margin: 2cm;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>REQUISIÇÃO DE MATERIAIS</h1>
        <p class="subtitle">Pedido #${pedido.id}</p>
      </div>

      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Data do Pedido:</span>
          <span class="info-value">${formatDate(pedido.data_hora)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Solicitante:</span>
          <span class="info-value">${user?.name || "N/A"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Setor Solicitante:</span>
          <span class="info-value">${setorAtual?.nome || pedido.setor_destino?.nome || "N/A"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Setor Fornecedor:</span>
          <span class="info-value">${pedido.setor_origem?.nome || "N/A"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value">
            <span class="status-badge status-${pedido.status_solicitacao}">
              ${getStatusLabel(pedido.status_solicitacao)}
            </span>
          </span>
        </div>
      </div>

      ${pedido.observacao ? `
        <div class="observacao-section">
          <h3>📋 Observação:</h3>
          <p>${pedido.observacao}</p>
        </div>
      ` : ''}

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 60px;">#</th>
            <th>Produto</th>
            <th style="width: 150px; text-align: center;">Qtd. Solicitada</th>
            <th style="width: 150px; text-align: center;">Qtd. Liberada</th>
          </tr>
        </thead>
        <tbody>
          ${(pedido.itens || []).map((item, index) => `
            <tr>
              <td style="text-align: center; font-weight: bold;">${index + 1}</td>
              <td>${item.produto?.nome || `Produto #${item.produto_id}`}</td>
              <td style="text-align: center; font-weight: bold;">${item.quantidade_solicitada}</td>
              <td style="text-align: center; font-weight: bold; color: ${item.quantidade_liberada > 0 ? '#059669' : '#64748b'};">
                ${item.quantidade_liberada || '-'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="signatures">
        <div class="signature-box">
          <div class="signature-line"></div>
          <p><strong>Solicitante</strong></p>
          <p style="font-size: 12px; color: #64748b;">${user?.name || ""}</p>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <p><strong>Responsável pela Entrega</strong></p>
          <p style="font-size: 12px; color: #64748b;">Setor: ${pedido.setor_origem?.nome || ""}</p>
        </div>
      </div>

      <div class="footer">
        <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <p style="margin-top: 5px;">Sistema de Gestão de Estoque - ProGest</p>
      </div>

      <${'script'}>
        window.onload = function() {
          window.print();
          // Fechar automaticamente após impressão (opcional)
          // window.onafterprint = function() { window.close(); };
        };
      </${'script'}>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

const irParaBuscar = () => {
  router.push("/itens?tab=itens");
};

onMounted(() => {
  fetchPedidos();
});
</script>
