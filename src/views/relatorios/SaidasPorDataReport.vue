<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid py-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4>Relatório de Saídas por Data</h4>
              <p class="text-muted mb-0">Saídas de estoque agrupadas por data de movimentação.</p>
              <small v-if="periodo" class="text-info">
                Período: {{ formatDate(periodo.data_inicial) }} até {{ formatDate(periodo.data_final) }}
              </small>
            </div>
            <div>
              <button class="btn btn-outline-secondary me-2" @click="resetFilters">Limpar</button>
              <button class="btn btn-primary" @click="loadSaidasPorData">Atualizar</button>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body">
              <div class="row g-2">
                <div class="col-md-2">
                  <label class="form-label">Data início</label>
                  <input type="date" v-model="filters.date_from" class="form-control" />
                </div>
                <div class="col-md-2">
                  <label class="form-label">Data fim</label>
                  <input type="date" v-model="filters.date_to" class="form-control" />
                </div>
                <div class="col-md-2">
                  <label class="form-label">Unidade</label>
                  <select v-model.number="filters.unidade_id" class="form-select" @change="onUnidadeChange">
                    <option :value="''">Todas</option>
                    <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.nome }}</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label">Setor</label>
                  <select v-model.number="filters.setor_id" class="form-select">
                    <option :value="''">Todos</option>
                    <option v-for="s in setoresFiltrados" :key="s.id" :value="s.id">{{ s.nome }}</option>
                  </select>
                </div>
                <div class="col-md-2 d-flex align-items-end justify-content-end">
                  <button class="btn btn-outline-success me-2" @click="exportExcel" :disabled="saidasPorData.length===0">Exportar Excel</button>
                  <button class="btn btn-outline-danger" @click="exportPdf" :disabled="saidasPorData.length===0">Exportar PDF</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-2 text-muted">Carregando dados...</p>
          </div>

          <div v-else>
            <div v-if="saidasPorData.length === 0" class="card">
              <div class="card-body text-center py-5 text-muted">
                <span class="material-icons" style="font-size: 48px; opacity: 0.3;">calendar_today</span>
                <p class="mt-3 mb-0">Nenhuma saída encontrada no período</p>
              </div>
            </div>

            <!-- Cards por dia -->
            <div v-else>
              <div class="mb-3">
                <strong>Total de dias com movimentação: {{ saidasPorData.length }}</strong>
              </div>

              <div v-for="dia in saidasPorData" :key="dia.data" class="card mb-3 shadow-sm">
                <!-- NÍVEL 1: Cabeçalho do Dia -->
                <div class="card-header dia-header" @click="toggleDia(dia.data)" style="cursor: pointer;">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-3">
                      <span class="material-icons expand-icon" :class="{ 'expanded': isDiaExpanded(dia.data) }">
                        {{ isDiaExpanded(dia.data) ? 'expand_more' : 'chevron_right' }}
                      </span>
                      <div>
                        <h5 class="mb-0">
                          <span class="material-icons align-middle me-2" style="font-size: 20px;">calendar_today</span>
                          {{ formatDateExtended(dia.data) }}
                        </h5>
                      </div>
                    </div>
                    <div class="d-flex gap-3">
                      <span class="badge bg-primary fs-6">
                        {{ dia.total_produtos }} {{ dia.total_produtos === 1 ? 'produto' : 'produtos' }}
                      </span>
                      <span class="badge bg-success fs-6">
                        Total: {{ dia.quantidade_total_dia }} unidades
                      </span>
                    </div>
                  </div>
                </div>

                <!-- NÍVEL 2: Produtos do dia (expansível) -->
                <div v-show="isDiaExpanded(dia.data)" class="card-body p-0">
                  <div v-for="(produtoItem, pIdx) in dia.produtos" :key="`${dia.data}-${produtoItem.produto.id}`" 
                       class="produto-container" :class="{ 'border-top': pIdx > 0 }">
                    
                    <!-- Header do Produto -->
                    <div class="produto-header" @click="toggleProduto(dia.data, produtoItem.produto.id)" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-2">
                          <span class="material-icons expand-icon-small" :class="{ 'expanded': isProdutoExpanded(dia.data, produtoItem.produto.id) }">
                            {{ isProdutoExpanded(dia.data, produtoItem.produto.id) ? 'expand_more' : 'chevron_right' }}
                          </span>
                          <div>
                            <strong class="produto-nome">{{ produtoItem.produto.nome }}</strong>
                            <div class="produto-meta">
                              <span v-if="produtoItem.produto.codigo_simpras" class="me-3">
                                <span class="material-icons align-middle" style="font-size: 14px;">barcode</span>
                                {{ produtoItem.produto.codigo_simpras }}
                              </span>
                              <span v-if="produtoItem.produto.codigo_barras" class="me-3">
                                <span class="material-icons align-middle" style="font-size: 14px;">qr_code</span>
                                {{ produtoItem.produto.codigo_barras }}
                              </span>
                              <span class="me-3">
                                <span class="material-icons align-middle" style="font-size: 14px;">straighten</span>
                                {{ produtoItem.produto.unidade_medida }}
                              </span>
                              <span class="badge bg-light text-dark">{{ produtoItem.produto.grupo_produto }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="d-flex gap-2">
                          <span class="badge bg-info">
                            {{ produtoItem.quantidade_total }} {{ produtoItem.produto.unidade_medida }}
                          </span>
                          <span class="badge bg-secondary">
                            {{ produtoItem.total_movimentacoes }} {{ produtoItem.total_movimentacoes === 1 ? 'movimentação' : 'movimentações' }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- NÍVEL 3: Movimentações do produto (expansível) -->
                    <div v-show="isProdutoExpanded(dia.data, produtoItem.produto.id)" class="movimentacoes-list">
                      <div v-if="!produtoItem.movimentacoes || produtoItem.movimentacoes.length === 0" class="text-center text-muted py-3">
                        Nenhuma movimentação detalhada
                      </div>
                      <div v-else class="table-responsive">
                        <table class="table table-sm table-hover mb-0">
                          <thead class="table-light">
                            <tr>
                              <th style="width: 80px;">ID</th>
                              <th style="width: 100px;">Quantidade</th>
                              <th>Setor Origem</th>
                              <th>Setor Destino</th>
                              <th style="width: 150px;">Data/Hora</th>
                              <th>Observação</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="mov in produtoItem.movimentacoes" :key="mov.movimentacao_id">
                              <td class="text-muted">#{{ mov.movimentacao_id }}</td>
                              <td>
                                <span class="badge bg-warning text-dark">{{ mov.quantidade }}</span>
                              </td>
                              <td>
                                <span class="material-icons align-middle text-danger" style="font-size: 16px;">arrow_upward</span>
                                {{ mov.setor_origem?.nome || '-' }}
                              </td>
                              <td>
                                <span class="material-icons align-middle text-success" style="font-size: 16px;">arrow_downward</span>
                                {{ mov.setor_destino?.nome || '-' }}
                              </td>
                              <td class="text-muted small">{{ formatDateTime(mov.data_hora) }}</td>
                              <td class="text-muted small">{{ mov.observacao || '-' }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import TemplateAdmin from '@/views/roleAdmin/TemplateAdmin.vue'
import functionsRelatorios from '@/functions/cad_relatorios.js'
import functionsPolos from '@/functions/cad_unidades_polos.js'
import functionsSetores from '@/functions/cad_setores.js'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default {
  name: 'SaidasPorDataReport',
  components: { TemplateAdmin },
  data() {
    const hoje = this.getTodayDate();
    return {
      filters: {
        date_from: hoje,
        date_to: hoje,
        setor_id: '',
      },
      saidasPorData: [],
      periodo: null,
      loading: false,
      expandedDias: {}, // Controla quais dias estão expandidos
      expandedProdutos: {}, // Controla quais produtos estão expandidos (formato: 'data-produtoId')
    }
  },
  mounted() {
    functionsPolos.listAll(this);
    functionsSetores.listAll(this);
    this.loadSaidasPorData();
  },
  computed: {
    unidades() {
      return this.$store.state.listPolos || [];
    },
    setores() {
      const setoresData = this.$store.state.listSetoresGerais;
      if (Array.isArray(setoresData)) return setoresData;
      if (setoresData?.data) return setoresData.data;
      return [];
    },
    setoresFiltrados() {
      if (!this.filters.unidade_id) return this.setores;
      return this.setores.filter(s => s.unidade_id == this.filters.unidade_id);
    }
  },
  methods: {
    onUnidadeChange() {
      this.filters.setor_id = '';
    },
    getTodayDate() {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const dia = String(hoje.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    },
    toggleDia(data) {
      this.expandedDias[data] = !this.expandedDias[data];
    },
    isDiaExpanded(data) {
      return this.expandedDias[data] || false;
    },
    toggleProduto(data, produtoId) {
      const key = `${data}-${produtoId}`;
      this.expandedProdutos[key] = !this.expandedProdutos[key];
    },
    isProdutoExpanded(data, produtoId) {
      const key = `${data}-${produtoId}`;
      return this.expandedProdutos[key] || false;
    },
    async loadSaidasPorData() {
      this.loading = true;
      try {
        const payloadFilters = {};
        if (this.filters.date_from) payloadFilters.date_from = this.filters.date_from;
        if (this.filters.date_to) payloadFilters.date_to = this.filters.date_to;
        if (this.filters.unidade_id) payloadFilters.unidade_id = this.filters.unidade_id;
        if (this.filters.setor_id) payloadFilters.setor_id = this.filters.setor_id;

        const result = await functionsRelatorios.listSaidasPorDataReport(this, payloadFilters);
        if (result && result.success) {
          this.saidasPorData = result.data || [];
          this.periodo = result.periodo || null;
          
          // Expandir todos os dias por padrão
          this.expandedDias = {};
          this.expandedProdutos = {};
          this.saidasPorData.forEach(dia => {
            this.expandedDias[dia.data] = true;
            // Expandir todos os produtos também
            if (dia.produtos) {
              dia.produtos.forEach(produtoItem => {
                const key = `${dia.data}-${produtoItem.produto.id}`;
                this.expandedProdutos[key] = true;
              });
            }
          });
        } else {
          this.saidasPorData = [];
          this.periodo = null;
        }
      } catch (e) {
        console.error('Erro ao carregar relatório de saídas por data:', e);
        this.saidasPorData = [];
        this.periodo = null;
      } finally {
        this.loading = false;
      }
    },
    resetFilters() {
      const hoje = this.getTodayDate();
      this.filters.date_from = hoje;
      this.filters.date_to = hoje;
      this.filters.unidade_id = '';
      this.filters.setor_id = '';
      this.loadSaidasPorData();
    },
    formatDate(d) {
      if (!d) return '-';
      const str = String(d).split('T')[0];
      const parts = str.split('-');
      if (parts.length < 3) return d;
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    },
    formatDateExtended(d) {
      if (!d) return '-';
      const date = new Date(d + 'T00:00:00');
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      const diaSemana = diasSemana[date.getDay()];
      const dia = date.getDate();
      const mes = meses[date.getMonth()];
      const ano = date.getFullYear();
      
      return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
    },
    formatDateTime(dt) {
      if (!dt) return '-';
      const parts = dt.split(' ');
      if (parts.length === 2) {
        const dateParts = parts[0].split('-');
        const timeParts = parts[1].split(':');
        if (dateParts.length === 3 && timeParts.length >= 2) {
          return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${timeParts[0]}:${timeParts[1]}`;
        }
      }
      return dt;
    },
    exportExcel() {
      if (!this.saidasPorData || this.saidasPorData.length === 0) return;
      
      // Preparar dados para o Excel
      const data = [];
      
      // Cabeçalho
      data.push(['Data', 'Total Produtos Dia', 'Qtd Total Dia', 'Produto', 'Cód.SIMPRAS', 'Cód.Barras', 'Unid.Medida', 'Grupo', 'Qtd Produto', 'ID Mov.', 'Qtd Mov.', 'Setor Origem', 'Setor Destino', 'Data/Hora', 'Observação']);
      
      // Dados com estrutura hierárquica achatada
      for (const dia of this.saidasPorData) {
        for (const produtoItem of dia.produtos || []) {
          if (produtoItem.movimentacoes && produtoItem.movimentacoes.length > 0) {
            produtoItem.movimentacoes.forEach((mov, movIdx) => {
              data.push([
                movIdx === 0 ? this.formatDate(dia.data) : '',
                movIdx === 0 ? dia.total_produtos : '',
                movIdx === 0 ? dia.quantidade_total_dia : '',
                movIdx === 0 ? produtoItem.produto.nome : '',
                movIdx === 0 ? (produtoItem.produto.codigo_simpras || '') : '',
                movIdx === 0 ? (produtoItem.produto.codigo_barras || '') : '',
                movIdx === 0 ? produtoItem.produto.unidade_medida : '',
                movIdx === 0 ? produtoItem.produto.grupo_produto : '',
                movIdx === 0 ? produtoItem.quantidade_total : '',
                mov.movimentacao_id || '',
                mov.quantidade || '',
                mov.setor_origem?.nome || '',
                mov.setor_destino?.nome || '',
                this.formatDateTime(mov.data_hora),
                mov.observacao || ''
              ]);
            });
          } else {
            data.push([
              this.formatDate(dia.data),
              dia.total_produtos,
              dia.quantidade_total_dia,
              produtoItem.produto.nome,
              produtoItem.produto.codigo_simpras || '',
              produtoItem.produto.codigo_barras || '',
              produtoItem.produto.unidade_medida,
              produtoItem.produto.grupo_produto,
              produtoItem.quantidade_total,
              'Sem movimentações',
              '',
              '',
              '',
              '',
              ''
            ]);
          }
        }
      }
      
      // Criar workbook e worksheet
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Saídas por Data');
      
      // Ajustar largura das colunas
      const colWidths = [
        { wch: 12 }, // Data
        { wch: 12 }, // Total Produtos Dia
        { wch: 12 }, // Qtd Total Dia
        { wch: 35 }, // Produto
        { wch: 15 }, // Cód.SIMPRAS
        { wch: 15 }, // Cód.Barras
        { wch: 12 }, // Unid.Medida
        { wch: 20 }, // Grupo
        { wch: 12 }, // Qtd Produto
        { wch: 10 }, // ID Mov.
        { wch: 10 }, // Qtd Mov.
        { wch: 25 }, // Setor Origem
        { wch: 25 }, // Setor Destino
        { wch: 18 }, // Data/Hora
        { wch: 30 }  // Observação
      ];
      ws['!cols'] = colWidths;
      
      // Baixar arquivo
      XLSX.writeFile(wb, `relatorio_saidas_por_data_${new Date().toISOString().slice(0,10)}.xlsx`);
    },
    exportPdf() {
      if (!this.saidasPorData || this.saidasPorData.length === 0) return;
      
      // Criar documento PDF em paisagem (landscape)
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Cabeçalho
      doc.setFontSize(16);
      doc.text('Relatorio de Saidas por Data', 14, 15);
      
      doc.setFontSize(10);
      if (this.periodo) {
        const periodo = `Periodo: ${this.formatDate(this.periodo.data_inicial)} ate ${this.formatDate(this.periodo.data_final)}`;
        doc.text(periodo, 14, 22);
      }
      
      // Preparar dados da tabela - estrutura achatada
      const tableData = [];
      for (const dia of this.saidasPorData) {
        for (const produtoItem of dia.produtos || []) {
          if (produtoItem.movimentacoes && produtoItem.movimentacoes.length > 0) {
            produtoItem.movimentacoes.forEach((mov, movIdx) => {
              tableData.push([
                movIdx === 0 ? this.formatDate(dia.data) : '',
                movIdx === 0 ? dia.quantidade_total_dia : '',
                movIdx === 0 ? produtoItem.produto.nome : '',
                movIdx === 0 ? (produtoItem.produto.codigo_simpras || '') : '',
                movIdx === 0 ? produtoItem.quantidade_total : '',
                mov.movimentacao_id || '',
                mov.quantidade || '',
                mov.setor_origem?.nome || '-',
                mov.setor_destino?.nome || '-',
                this.formatDateTime(mov.data_hora)
              ]);
            });
          } else {
            tableData.push([
              this.formatDate(dia.data),
              dia.quantidade_total_dia,
              produtoItem.produto.nome,
              produtoItem.produto.codigo_simpras || '',
              produtoItem.quantidade_total,
              'Sem mov.',
              '',
              '',
              '',
              ''
            ]);
          }
        }
      }
      
      // Gerar tabela
      autoTable(doc, {
        startY: 28,
        head: [['Data', 'Qtd Dia', 'Produto', 'Cod.SIMPRAS', 'Qtd Prod', 'ID Mov', 'Qtd', 'Origem', 'Destino', 'Data/Hora']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [13, 110, 253], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 20 },  // Data
          1: { cellWidth: 18 },  // Qtd Dia
          2: { cellWidth: 50 },  // Produto
          3: { cellWidth: 25 },  // Cod.SIMPRAS
          4: { cellWidth: 18 },  // Qtd Prod
          5: { cellWidth: 15 },  // ID Mov
          6: { cellWidth: 15 },  // Qtd
          7: { cellWidth: 35 },  // Origem
          8: { cellWidth: 35 },  // Destino
          9: { cellWidth: 30 }   // Data/Hora
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          // Rodapé com número de página
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Pagina ${data.pageNumber} de ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }
      });
      
      // Salvar PDF
      doc.save(`relatorio_saidas_por_data_${new Date().toISOString().slice(0,10)}.pdf`);
    }
  }
}
</script>

<style scoped>
.material-icons {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}

/* Cabeçalho do dia */
.dia-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.25rem;
  border: none;
  transition: all 0.3s ease;
}

.dia-header:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f91 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.dia-header h5 {
  color: white;
  font-weight: 600;
}

/* Ícones de expansão */
.expand-icon {
  transition: transform 0.3s ease;
  font-size: 24px;
  color: white;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.expand-icon-small {
  transition: transform 0.3s ease;
  font-size: 20px;
  color: #667eea;
}

.expand-icon-small.expanded {
  transform: rotate(90deg);
}

/* Container de produtos */
.produto-container {
  background-color: #f8f9fa;
}

.produto-header {
  padding: 1rem 1.25rem;
  transition: background-color 0.2s ease;
}

.produto-header:hover {
  background-color: #e9ecef;
}

.produto-nome {
  font-size: 1.05rem;
  color: #2c3e50;
}

.produto-meta {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
}

/* Lista de movimentações */
.movimentacoes-list {
  background-color: #ffffff;
  border-top: 2px solid #dee2e6;
}

.movimentacoes-list .table {
  margin-bottom: 0;
}

.movimentacoes-list thead {
  background-color: #f1f3f5;
}

.movimentacoes-list tbody tr:hover {
  background-color: #f8f9fa;
}

/* Badges customizados */
.badge {
  font-weight: 500;
  padding: 0.35em 0.65em;
}

/* Animações suaves */
.card {
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}

/* Spinner de loading */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Tabela responsiva */
.table-responsive {
  border-radius: 0;
}

/* Cores dos ícones de transferência */
.text-danger {
  color: #dc3545 !important;
}

.text-success {
  color: #28a745 !important;
}

/* Espaçamento */
.gap-2 {
  gap: 0.5rem !important;
}

.gap-3 {
  gap: 1rem !important;
}

/* Cards sem dados */
.card-body.py-5 {
  padding-top: 3rem !important;
  padding-bottom: 3rem !important;
}
</style>

