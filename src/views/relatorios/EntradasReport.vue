<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid py-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4>Relatório de Entradas por Notas Fiscais</h4>
              <p class="text-muted mb-0">Visão agregada das entradas de estoque por nota fiscal.</p>
            </div>
            <div>
              <button class="btn btn-outline-secondary me-2" @click="resetFilters">Limpar</button>
              <button class="btn btn-primary" @click="loadEntries">Atualizar</button>
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
                  <button class="btn btn-outline-success me-2" @click="exportExcel" :disabled="entries.length===0">Exportar Excel</button>
                  <button class="btn btn-outline-danger" @click="exportPdf" :disabled="entries.length===0">Exportar PDF</button>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div v-if="loading" class="text-center py-4">Carregando...</div>
              <div v-else>
                <div class="mb-3">Total de entradas: <strong>{{ entries.length }}</strong></div>
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th style="width: 50px;"></th>
                        <th>ID</th>
                        <th>Data</th>
                        <th>Nota Fiscal</th>
                        <th>Fornecedor</th>
                        <th>Setor</th>
                        <th>Total Itens</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="e in entries" :key="e.id">
                        <!-- Linha principal da entrada -->
                        <tr class="entrada-row" @click="toggleRow(e.id)" style="cursor: pointer;">
                          <td>
                            <span class="material-icons expand-icon" :class="{ 'expanded': expandedRows[e.id] }">
                              {{ expandedRows[e.id] ? 'expand_more' : 'chevron_right' }}
                            </span>
                          </td>
                          <td>{{ e.id }}</td>
                          <td>{{ formatDate(e.created_at) }}</td>
                          <td>{{ e.nota_fiscal || '-' }}</td>
                          <td>{{ formatFornecedor(e.fornecedor) }}</td>
                          <td>{{ e.setor?.nome || '-' }}</td>
                          <td>
                            <span class="badge bg-info">{{ e.itens?.length || 0 }} itens</span>
                          </td>
                        </tr>
                        
                        <!-- Linha expansível com tabela de produtos -->
                        <tr v-if="expandedRows[e.id]" class="expanded-content">
                          <td colspan="7" class="p-0">
                            <div class="produtos-container">
                              <table class="table table-sm mb-0">
                                <thead class="table-light">
                                  <tr>
                                    <th style="width: 100px;">Quantidade</th>
                                    <th>Produto</th>
                                    <th style="width: 120px;">Cód. SIMPRAS</th>
                                    <th style="width: 120px;">Cód. Barras</th>
                                    <th style="width: 100px;">Lote</th>
                                    <th style="width: 110px;">Fabricação</th>
                                    <th style="width: 110px;">Vencimento</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-if="!e.itens || e.itens.length === 0">
                                    <td colspan="7" class="text-center text-muted">Nenhum produto nesta entrada</td>
                                  </tr>
                                  <tr v-else v-for="(item, idx) in e.itens" :key="idx">
                                    <td>
                                      <span class="badge bg-secondary">{{ item.quantidade }}</span>
                                    </td>
                                    <td class="fw-semibold">{{ item.produto?.nome || `Produto #${item.produto_id}` }}</td>
                                    <td class="text-muted small">{{ item.produto?.codigo_simpras || '-' }}</td>
                                    <td class="text-muted small">{{ item.produto?.codigo_barras || '-' }}</td>
                                    <td class="text-muted small">{{ item.lote || '-' }}</td>
                                    <td class="text-muted small">{{ formatDate(item.data_fabricacao) }}</td>
                                    <td class="text-muted small">{{ formatDate(item.data_vencimento) }}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
                <div v-if="entries.length===0" class="text-center py-4 text-muted">Nenhuma entrada encontrada</div>
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
  name: 'EntradasReport',
  components: { TemplateAdmin },
  data() {
    const hoje = this.getTodayDate();
    return {
      filters: {
        date_from: hoje,
        date_to: hoje,
        unidade_id: '',
        setor_id: '',
      },
      entries: [],
      loading: false,
      expandedRows: {}, // Controla quais linhas estão expandidas
    }
  },
  mounted() {
    functionsPolos.listAll(this);
    functionsSetores.listAll(this);
    this.loadEntries();
  },
  computed: {
    unidades() {
      return this.$store.state.listPolos || [];
    },
    setores() {
      const setoresData = this.$store.state.listSetoresGerais;
      if (Array.isArray(setoresData)) {
        return setoresData;
      } else if (setoresData?.data && Array.isArray(setoresData.data)) {
        return setoresData.data;
      }
      return [];
    },
    setoresFiltrados() {
      if (!this.filters.unidade_id) {
        return this.setores;
      }
      return this.setores.filter(s => s.unidade_id == this.filters.unidade_id);
    }
  },
  methods: {
    getTodayDate() {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const dia = String(hoje.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    },
    toggleRow(entradaId) {
      this.expandedRows[entradaId] = !this.expandedRows[entradaId];
    },
    onUnidadeChange() {
      this.filters.setor_id = '';
    },
    formatFornecedor(fornecedor) {
      if (!fornecedor) return '-';
      const cnpj = fornecedor.cnpj || '';
      const razao = fornecedor.razao_social_nome || fornecedor.razao_social || fornecedor.nome || '';
      if (cnpj && razao) {
        return `${cnpj} - ${razao}`;
      }
      return razao || cnpj || '-';
    },
    async loadEntries() {
      this.loading = true;
      try {
        const payloadFilters = {};
        if (this.filters.date_from) payloadFilters.date_from = this.filters.date_from;
        if (this.filters.date_to) payloadFilters.date_to = this.filters.date_to;
        if (this.filters.unidade_id) payloadFilters.unidade_id = this.filters.unidade_id;
        if (this.filters.setor_id) payloadFilters.setor_id = this.filters.setor_id;

        const result = await functionsRelatorios.listEntradasReport(this, payloadFilters);
        if (result && result.success) {
          this.entries = result.data || [];
          // Expandir todas as linhas por padrão
          this.expandedRows = {};
          this.entries.forEach(entry => {
            this.expandedRows[entry.id] = true;
          });
        } else {
          this.entries = [];
        }
      } catch (e) {
        console.error('Erro ao carregar relatório de entradas:', e);
        this.entries = [];
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
      this.loadEntries();
    },
    formatDate(d) {
      if (!d) return '-';
      const str = String(d).split('T')[0];
      const parts = str.split('-');
      if (parts.length<3) return d;
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    },
    exportExcel() {
      if (!this.entries || this.entries.length===0) return;
      
      // Preparar dados para o Excel
      const data = [];
      
      // Cabeçalho
      data.push(['ID','Data','Nota Fiscal','Fornecedor','Setor','Qtd','Produto','Cód.SIMPRAS','Cód.Barras','Lote','Fabricação','Vencimento']);
      
      // Dados
      for (const e of this.entries) {
        if (e.itens && e.itens.length > 0) {
          e.itens.forEach(item => {
            data.push([
              e.id,
              this.formatDate(e.created_at),
              e.nota_fiscal || '',
              this.formatFornecedor(e.fornecedor),
              e.setor?.nome || '',
              item.quantidade || '',
              item.produto?.nome || `Produto #${item.produto_id}`,
              item.produto?.codigo_simpras || '',
              item.produto?.codigo_barras || '',
              item.lote || '',
              this.formatDate(item.data_fabricacao),
              this.formatDate(item.data_vencimento)
            ]);
          });
        } else {
          data.push([
            e.id,
            this.formatDate(e.created_at),
            e.nota_fiscal || '',
            this.formatFornecedor(e.fornecedor),
            e.setor?.nome || '',
            '',
            'Sem itens',
            '',
            '',
            '',
            '',
            ''
          ]);
        }
      }
      
      // Criar workbook e worksheet
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Entradas');
      
      // Ajustar largura das colunas
      const colWidths = [
        { wch: 8 },  // ID
        { wch: 12 }, // Data
        { wch: 18 }, // Nota Fiscal
        { wch: 35 }, // Fornecedor
        { wch: 20 }, // Setor
        { wch: 8 },  // Qtd
        { wch: 30 }, // Produto
        { wch: 15 }, // Cód.SIMPRAS
        { wch: 15 }, // Cód.Barras
        { wch: 15 }, // Lote
        { wch: 12 }, // Fabricação
        { wch: 12 }  // Vencimento
      ];
      ws['!cols'] = colWidths;
      
      // Baixar arquivo
      XLSX.writeFile(wb, `relatorio_entradas_${new Date().toISOString().slice(0,10)}.xlsx`);
    },
    exportPdf() {
      if (!this.entries || this.entries.length===0) return;
      
      // Criar documento PDF em paisagem (landscape)
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Cabeçalho
      doc.setFontSize(16);
      doc.text('Relatorio de Entradas', 14, 15);
      
      doc.setFontSize(10);
      const periodo = `Periodo: ${this.formatDate(this.filters.date_from) || 'Todos'} ate ${this.formatDate(this.filters.date_to) || 'Todos'}`;
      doc.text(periodo, 14, 22);
      
      // Preparar dados da tabela
      const tableData = [];
      for (const e of this.entries) {
        if (e.itens && e.itens.length > 0) {
          e.itens.forEach((item, idx) => {
            tableData.push([
              idx === 0 ? e.id : '',
              idx === 0 ? this.formatDate(e.created_at) : '',
              idx === 0 ? (e.nota_fiscal || '-') : '',
              idx === 0 ? this.formatFornecedor(e.fornecedor) : '',
              idx === 0 ? (e.setor?.nome || '-') : '',
              item.quantidade || '',
              item.produto?.nome || `Produto #${item.produto_id}`,
              item.produto?.codigo_simpras || '',
              item.produto?.codigo_barras || '',
              item.lote || '',
              this.formatDate(item.data_fabricacao),
              this.formatDate(item.data_vencimento)
            ]);
          });
        } else {
          tableData.push([
            e.id,
            this.formatDate(e.created_at),
            e.nota_fiscal || '-',
            this.formatFornecedor(e.fornecedor),
            e.setor?.nome || '-',
            '',
            'Sem itens',
            '',
            '',
            '',
            '',
            ''
          ]);
        }
      }
      
      // Gerar tabela
      autoTable(doc, {
        startY: 28,
        head: [['ID', 'Data', 'NF', 'Fornecedor', 'Setor', 'Qtd', 'Produto', 'Cod.SIMPRAS', 'Cod.Barras', 'Lote', 'Fabric.', 'Venc.']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [13, 110, 253], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 18 },
          2: { cellWidth: 20 },
          3: { cellWidth: 50 },
          4: { cellWidth: 30 },
          5: { cellWidth: 12 },
          6: { cellWidth: 45 },
          7: { cellWidth: 20 },
          8: { cellWidth: 20 },
          9: { cellWidth: 18 },
          10: { cellWidth: 16 },
          11: { cellWidth: 16 }
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
      doc.save(`relatorio_entradas_${new Date().toISOString().slice(0,10)}.pdf`);
    }
  }
}
</script>

<style scoped>
.entrada-row:hover {
  background-color: #f8f9fa;
}

.expand-icon {
  font-size: 20px;
  color: #6c757d;
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(0deg);
}

.expanded-content {
  background-color: #f8f9fa;
}

.produtos-container {
  padding: 1rem;
  border-left: 3px solid #0d6efd;
  margin-left: 50px;
}

.table-sm th {
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
}

.table-sm td {
  vertical-align: middle;
  font-size: 0.9rem;
}

.badge {
  font-size: 0.75rem;
  min-width: 40px;
  text-align: center;
}

.fw-semibold {
  font-weight: 600;
}

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
</style>
