<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid py-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4>Relatório de Estoque Atual</h4>
              <p class="text-muted mb-0">Situação atual do estoque por produto e setor.</p>
            </div>
            <div>
              <button class="btn btn-outline-secondary me-2" @click="resetFilters">Limpar</button>
              <button class="btn btn-primary" @click="loadEstoque">Atualizar</button>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body">
              <div class="row g-2">
                <div class="col-md-3">
                  <label class="form-label">Unidade</label>
                  <select v-model.number="filters.unidade_id" class="form-select" @change="onUnidadeChange">
                    <option :value="''">Todas</option>
                    <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.nome }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Setor</label>
                  <select v-model.number="filters.setor_id" class="form-select">
                    <option :value="''">Todos</option>
                    <option v-for="s in setoresFiltrados" :key="s.id" :value="s.id">{{ s.nome }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Grupo de Produto</label>
                  <select v-model.number="filters.grupo_produto_id" class="form-select">
                    <option :value="''">Todos</option>
                    <option v-for="g in gruposProdutos" :key="g.id" :value="g.id">{{ g.nome }}</option>
                  </select>
                </div>
                <div class="col-md-3 d-flex align-items-end justify-content-end">
                  <button class="btn btn-outline-success me-2" @click="exportExcel" :disabled="estoque.length===0">Exportar Excel</button>
                  <button class="btn btn-outline-danger" @click="exportPdf" :disabled="estoque.length===0">Exportar PDF</button>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-2 text-muted">Carregando dados...</p>
              </div>
              <div v-else>
                <div class="mb-3 d-flex flex-wrap gap-3 align-items-center">
                  <span class="badge bg-primary fs-6">
                    Total: {{ estoque.length }} itens
                  </span>
                  <span v-if="totalizadores.total_produtos_disponiveis" class="badge bg-success fs-6">
                    Disponíveis: {{ totalizadores.total_produtos_disponiveis }}
                  </span>
                  <span v-if="totalizadores.total_produtos_indisponiveis" class="badge bg-secondary fs-6">
                    Indisponíveis: {{ totalizadores.total_produtos_indisponiveis }}
                  </span>
                  <span v-if="totalizadores.total_abaixo_minimo" class="badge bg-warning text-dark fs-6">
                    Abaixo do mínimo: {{ totalizadores.total_abaixo_minimo }}
                  </span>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th style="width: 50px;"></th>
                        <th>Produto</th>
                        <th style="width: 120px;">Cód. SIMPRAS</th>
                        <th style="width: 120px;">Cód. Barras</th>
                        <th style="width: 100px;">Unid. Medida</th>
                        <th>Grupo</th>
                        <th style="width: 120px;">Localização</th>
                        <th style="width: 120px;" class="text-end">Quantidade</th>
                        <th style="width: 100px;" class="text-end">Mínimo</th>
                        <th style="width: 100px;">Status</th>
                        <th style="width: 250px;">Setor / Unidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="item in estoque" :key="item.id">
                        <!-- Linha principal do item -->
                        <tr class="estoque-row" @click="toggleRow(item.id)" style="cursor: pointer;">
                          <td>
                            <span class="material-icons expand-icon" :class="{ 'expanded': expandedRows[item.id] }">
                              {{ expandedRows[item.id] ? 'expand_more' : 'chevron_right' }}
                            </span>
                          </td>
                          <td>
                            <strong>{{ item.produto?.nome || '-' }}</strong>
                          </td>
                          <td>{{ item.produto?.codigo_simpras || '-' }}</td>
                          <td>{{ item.produto?.codigo_barras || '-' }}</td>
                          <td>{{ item.produto?.unidadeMedida?.nome || '-' }}</td>
                          <td>
                            <span class="badge bg-light text-dark">
                              {{ item.produto?.grupoProduto?.nome || '-' }}
                            </span>
                          </td>
                          <td>{{ item.localizacao || '-' }}</td>
                          <td class="text-end">
                            <span class="badge" :class="getQuantidadeBadgeClass(item.quantidade_atual, item.quantidade_minima)">
                              {{ item.quantidade_atual || 0 }}
                            </span>
                          </td>
                          <td class="text-end text-muted">
                            {{ item.quantidade_minima || 0 }}
                          </td>
                          <td>
                            <span class="badge" :class="getStatusDisponibilidadeBadgeClass(item.status_disponibilidade)">
                              {{ getStatusDisponibilidadeText(item.status_disponibilidade) }}
                            </span>
                            <span v-if="item.abaixo_minimo" class="badge bg-warning text-dark ms-1" title="Estoque abaixo do mínimo">
                              <span class="material-icons" style="font-size: 14px;">warning</span>
                            </span>
                          </td>
                          <td>
                            <div>{{ getSetorCompleto(item.setor) }}</div>
                          </td>
                        </tr>
                        
                        <!-- Linha expansível com lotes -->
                        <tr v-if="expandedRows[item.id]" class="expanded-content">
                          <td colspan="11" class="p-0">
                            <div class="lotes-container">
                              <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="mb-0">Lotes do Produto</h6>
                                <div class="d-flex gap-2">
                                  <span v-if="item.lotes_info?.total_lotes" class="badge bg-info">
                                    {{ item.lotes_info.total_lotes }} {{ item.lotes_info.total_lotes === 1 ? 'lote' : 'lotes' }}
                                  </span>
                                  <span v-if="item.lotes_info?.quantidade_total_lotes" class="badge bg-success">
                                    Total: {{ item.lotes_info.quantidade_total_lotes }} unidades
                                  </span>
                                </div>
                              </div>
                              
                              <!-- Alerta de lote próximo ao vencimento -->
                              <div v-if="item.lotes_info?.lote_proximo_vencimento" class="alert alert-warning py-2 mb-3">
                                <div class="d-flex align-items-center gap-2">
                                  <span class="material-icons" style="font-size: 20px;">warning</span>
                                  <div>
                                    <strong>Lote próximo ao vencimento:</strong> 
                                    {{ item.lotes_info.lote_proximo_vencimento.lote }} - 
                                    {{ item.lotes_info.lote_proximo_vencimento.quantidade }} unidades - 
                                    Vence em {{ item.lotes_info.lote_proximo_vencimento.dias_para_vencer }} dias
                                    ({{ formatDate(item.lotes_info.lote_proximo_vencimento.data_vencimento) }})
                                  </div>
                                </div>
                              </div>

                              <div v-if="!item.lotes_info?.lotes || item.lotes_info.lotes.length === 0" class="text-center text-muted py-3">
                                Nenhum lote encontrado
                              </div>
                              <table v-else class="table table-sm mb-0">
                                <thead class="table-light">
                                  <tr>
                                    <th style="width: 150px;">Lote</th>
                                    <th style="width: 120px;">Quantidade</th>
                                    <th style="width: 150px;">Data Fabricação</th>
                                    <th style="width: 150px;">Data Vencimento</th>
                                    <th style="width: 120px;">Dias p/ Vencer</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(lote, idx) in item.lotes_info.lotes" :key="lote.id || idx" :class="{ 'table-danger': lote.vencido, 'table-warning': !lote.vencido && lote.dias_para_vencer <= 30 }">
                                    <td class="fw-semibold">{{ lote.lote || '-' }}</td>
                                    <td>
                                      <span class="badge bg-info">{{ lote.quantidade_disponivel }}</span>
                                    </td>
                                    <td class="text-muted small">{{ formatDate(lote.data_fabricacao) }}</td>
                                    <td class="text-muted small">{{ formatDate(lote.data_vencimento) }}</td>
                                    <td class="text-center">
                                      <span v-if="lote.vencido" class="badge bg-danger">Vencido</span>
                                      <span v-else-if="lote.dias_para_vencer <= 30" class="badge bg-warning text-dark">{{ lote.dias_para_vencer }} dias</span>
                                      <span v-else class="text-muted">{{ lote.dias_para_vencer }} dias</span>
                                    </td>
                                    <td>
                                      <span class="badge" :class="getLoteStatusBadgeClass(lote.vencido, lote.dias_para_vencer)">
                                        {{ getLoteStatusText(lote.vencido, lote.dias_para_vencer) }}
                                      </span>
                                    </td>
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
                <div v-if="estoque.length===0" class="text-center py-5 text-muted">
                  <span class="material-icons" style="font-size: 48px; opacity: 0.3;">inventory_2</span>
                  <p class="mt-3 mb-0">Nenhum item em estoque encontrado</p>
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
import functionsGrupoProduto from '@/functions/cad_grupo_produto.js'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default {
  name: 'EstoqueReport',
  components: { TemplateAdmin },
  data() {
    return {
      filters: {
        unidade_id: '',
        setor_id: '',
        grupo_produto_id: '',
      },
      estoque: [],
      totalizadores: {
        total_itens: 0,
        total_produtos_disponiveis: 0,
        total_produtos_indisponiveis: 0,
        total_abaixo_minimo: 0
      },
      loading: false,
      expandedRows: {}, // Controla quais linhas estão expandidas
    }
  },
  mounted() {
    functionsPolos.listAll(this);
    functionsSetores.listAll(this);
    functionsGrupoProduto.listAll(this);
    this.loadEstoque();
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
    },
    gruposProdutos() {
      return this.$store.state.listGrupoProdutos || [];
    }
  },
  methods: {
    onUnidadeChange() {
      this.filters.setor_id = '';
    },
    toggleRow(itemId) {
      this.expandedRows[itemId] = !this.expandedRows[itemId];
    },
    async loadEstoque() {
      this.loading = true;
      try {
        const payloadFilters = {};
        if (this.filters.unidade_id) payloadFilters.unidade_id = this.filters.unidade_id;
        if (this.filters.setor_id) payloadFilters.setor_id = this.filters.setor_id;
        if (this.filters.grupo_produto_id) payloadFilters.grupo_produto_id = this.filters.grupo_produto_id;

        const result = await functionsRelatorios.listEstoqueReport(this, payloadFilters);
        if (result && result.success) {
          this.estoque = result.data || [];
          
          // Capturar totalizadores da resposta
          if (result.totalizadores) {
            this.totalizadores = result.totalizadores;
          }
          
          // Expandir todas as linhas por padrão
          this.expandedRows = {};
          this.estoque.forEach(item => {
            this.expandedRows[item.id] = true;
          });
        } else {
          this.estoque = [];
          this.totalizadores = {
            total_itens: 0,
            total_produtos_disponiveis: 0,
            total_produtos_indisponiveis: 0,
            total_abaixo_minimo: 0
          };
        }
      } catch (e) {
        console.error('Erro ao carregar relatório de estoque:', e);
        this.estoque = [];
        this.totalizadores = {
          total_itens: 0,
          total_produtos_disponiveis: 0,
          total_produtos_indisponiveis: 0,
          total_abaixo_minimo: 0
        };
      } finally {
        this.loading = false;
      }
    },
    resetFilters() {
      this.filters.unidade_id = '';
      this.filters.setor_id = '';
      this.filters.grupo_produto_id = '';
      this.loadEstoque();
    },
    formatDate(d) {
      if (!d) return '-';
      const str = String(d).split('T')[0];
      const parts = str.split('-');
      if (parts.length < 3) return d;
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    },
    getStatusDisponibilidadeText(status) {
      const statusMap = {
        'D': 'Disponível',
        'I': 'Indisponível',
        'R': 'Reservado',
        'B': 'Bloqueado'
      };
      return statusMap[status] || status || '-';
    },
    getStatusDisponibilidadeBadgeClass(status) {
      const classMap = {
        'D': 'bg-success',
        'I': 'bg-secondary',
        'R': 'bg-warning text-dark',
        'B': 'bg-danger'
      };
      return classMap[status] || 'bg-secondary';
    },
    getQuantidadeBadgeClass(quantidade, minimo) {
      const qtd = parseFloat(quantidade) || 0;
      const min = parseFloat(minimo) || 0;
      
      if (qtd === 0) return 'bg-secondary';
      if (qtd <= min) return 'bg-danger';
      if (qtd <= min * 1.2) return 'bg-warning text-dark'; // 20% acima do mínimo
      return 'bg-success';
    },
    getLoteStatusText(vencido, diasParaVencer) {
      if (vencido) return 'Vencido';
      if (diasParaVencer <= 30) return 'Atenção';
      if (diasParaVencer <= 90) return 'Monitorar';
      return 'Normal';
    },
    getLoteStatusBadgeClass(vencido, diasParaVencer) {
      if (vencido) return 'bg-danger';
      if (diasParaVencer <= 30) return 'bg-warning text-dark';
      if (diasParaVencer <= 90) return 'bg-info';
      return 'bg-success';
    },
    getSetorCompleto(setor) {
      if (!setor) return '-';
      const nomeSetor = setor.nome || '-';
      const nomeUnidade = setor.unidade?.nome;
      
      if (nomeUnidade) {
        return `${nomeSetor} - ${nomeUnidade}`;
      }
      return nomeSetor;
    },
    exportExcel() {
      if (!this.estoque || this.estoque.length === 0) return;
      
      // Preparar dados para o Excel
      const data = [];
      
      // Cabeçalho
      data.push(['Produto', 'Cód.SIMPRAS', 'Cód.Barras', 'Unid.Medida', 'Grupo', 'Setor / Unidade', 'Localização', 'Qtd Atual', 'Qtd Mínima', 'Status', 'Lote', 'Qtd Lote', 'Fabricação', 'Vencimento', 'Dias p/ Vencer', 'Status Lote']);
      
      // Dados
      for (const item of this.estoque) {
        if (item.lotes_info?.lotes && item.lotes_info.lotes.length > 0) {
          item.lotes_info.lotes.forEach((lote, idx) => {
            data.push([
              idx === 0 ? item.produto?.nome || '-' : '',
              idx === 0 ? (item.produto?.codigo_simpras || '') : '',
              idx === 0 ? (item.produto?.codigo_barras || '') : '',
              idx === 0 ? (item.produto?.unidadeMedida?.nome || '') : '',
              idx === 0 ? (item.produto?.grupoProduto?.nome || '') : '',
              idx === 0 ? this.getSetorCompleto(item.setor) : '',
              idx === 0 ? (item.localizacao || '') : '',
              idx === 0 ? item.quantidade_atual : '',
              idx === 0 ? item.quantidade_minima : '',
              idx === 0 ? this.getStatusDisponibilidadeText(item.status_disponibilidade) : '',
              lote.lote || '',
              lote.quantidade_disponivel || '',
              this.formatDate(lote.data_fabricacao),
              this.formatDate(lote.data_vencimento),
              lote.dias_para_vencer || '',
              this.getLoteStatusText(lote.vencido, lote.dias_para_vencer)
            ]);
          });
        } else {
          data.push([
            item.produto?.nome || '-',
            item.produto?.codigo_simpras || '',
            item.produto?.codigo_barras || '',
            item.produto?.unidadeMedida?.nome || '',
            item.produto?.grupoProduto?.nome || '',
            this.getSetorCompleto(item.setor),
            item.localizacao || '',
            item.quantidade_atual,
            item.quantidade_minima,
            this.getStatusDisponibilidadeText(item.status_disponibilidade),
            'Sem lotes',
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
      XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
      
      // Ajustar largura das colunas
      const colWidths = [
        { wch: 35 }, // Produto
        { wch: 15 }, // Cód.SIMPRAS
        { wch: 15 }, // Cód.Barras
        { wch: 12 }, // Unid.Medida
        { wch: 20 }, // Grupo
        { wch: 40 }, // Setor / Unidade
        { wch: 15 }, // Localização
        { wch: 10 }, // Qtd Atual
        { wch: 10 }, // Qtd Mínima
        { wch: 12 }, // Status
        { wch: 15 }, // Lote
        { wch: 10 }, // Qtd Lote
        { wch: 12 }, // Fabricação
        { wch: 12 }, // Vencimento
        { wch: 12 }, // Dias p/ Vencer
        { wch: 12 }  // Status Lote
      ];
      ws['!cols'] = colWidths;
      
      // Baixar arquivo
      XLSX.writeFile(wb, `relatorio_estoque_${new Date().toISOString().slice(0,10)}.xlsx`);
    },
    exportPdf() {
      if (!this.estoque || this.estoque.length === 0) return;
      
      // Criar documento PDF em paisagem (landscape)
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Cabeçalho
      doc.setFontSize(16);
      doc.text('Relatorio de Estoque Atual', 14, 15);
      
      doc.setFontSize(10);
      const dataHoje = new Date().toLocaleDateString('pt-BR');
      doc.text(`Data: ${dataHoje}`, 14, 22);
      
      // Adicionar totalizadores
      if (this.totalizadores.total_itens > 0) {
        doc.setFontSize(9);
        doc.text(`Total: ${this.totalizadores.total_itens} itens | Disponiveis: ${this.totalizadores.total_produtos_disponiveis} | Indisponiveis: ${this.totalizadores.total_produtos_indisponiveis} | Abaixo minimo: ${this.totalizadores.total_abaixo_minimo}`, 14, 28);
      }
      
      // Preparar dados da tabela
      const tableData = [];
      for (const item of this.estoque) {
        if (item.lotes_info?.lotes && item.lotes_info.lotes.length > 0) {
          item.lotes_info.lotes.forEach((lote, idx) => {
            tableData.push([
              idx === 0 ? (item.produto?.nome || '-') : '',
              idx === 0 ? (item.produto?.codigo_simpras || '') : '',
              idx === 0 ? this.getSetorCompleto(item.setor) : '',
              idx === 0 ? item.quantidade_atual : '',
              idx === 0 ? item.quantidade_minima : '',
              idx === 0 ? this.getStatusDisponibilidadeText(item.status_disponibilidade).substring(0, 4) : '',
              lote.lote || '',
              lote.quantidade_disponivel || '',
              this.formatDate(lote.data_vencimento),
              lote.dias_para_vencer || '',
              this.getLoteStatusText(lote.vencido, lote.dias_para_vencer).substring(0, 8)
            ]);
          });
        } else {
          tableData.push([
            item.produto?.nome || '-',
            item.produto?.codigo_simpras || '',
            this.getSetorCompleto(item.setor),
            item.quantidade_atual,
            item.quantidade_minima,
            this.getStatusDisponibilidadeText(item.status_disponibilidade).substring(0, 4),
            '-',
            '',
            '',
            '',
            ''
          ]);
        }
      }
      
      // Gerar tabela
      autoTable(doc, {
        startY: this.totalizadores.total_itens > 0 ? 32 : 26,
        head: [['Produto', 'Cod.SIM', 'Setor/Unidade', 'Qtd', 'Min', 'Status', 'Lote', 'Q.Lote', 'Venc.', 'Dias', 'St.Lote']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [25, 135, 84], fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 6 },
        columnStyles: {
          0: { cellWidth: 50 },  // Produto
          1: { cellWidth: 15 },  // Cod.SIMPRAS
          2: { cellWidth: 45 },  // Setor/Unidade
          3: { cellWidth: 12 },  // Qtd
          4: { cellWidth: 12 },  // Min
          5: { cellWidth: 15 },  // Status
          6: { cellWidth: 18 },  // Lote
          7: { cellWidth: 15 },  // Q.Lote
          8: { cellWidth: 18 },  // Venc.
          9: { cellWidth: 12 },  // Dias
          10: { cellWidth: 18 }  // St.Lote
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
      doc.save(`relatorio_estoque_${new Date().toISOString().slice(0,10)}.pdf`);
    }
  }
}
</script>

<style scoped>
.estoque-row:hover {
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

.lotes-container {
  padding: 1.5rem;
  border-left: 4px solid #198754;
  margin-left: 50px;
}

.lotes-container h6 {
  color: #198754;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  margin-bottom: 1rem;
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

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
