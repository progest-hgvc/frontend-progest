<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid py-4">
          <!-- Header Section -->
          <div class="header-section mb-4">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h3 class="fw-bold mb-2">
                  <i class="mdi mdi-file-chart-outline me-2 text-primary"></i>
                  Central de Relatórios
                </h3>
                <p class="text-muted mb-0">
                  Análises completas e exportações em tempo real do sistema ProGest
                </p>
              </div>
              <div class="text-end">
                <span class="badge bg-success fs-6 px-3 py-2">
                  <i class="mdi mdi-check-circle me-1"></i>
                  Sistema Online
                </span>
              </div>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="row g-3 mb-4">
            <div class="col-md-3">
              <div class="stat-card stat-primary">
                <div class="stat-icon">
                  <i class="mdi mdi-file-document-multiple"></i>
                </div>
                <div class="stat-content">
                  <h2 class="mb-0">{{ totalRelatorios }}</h2>
                  <p class="mb-0">Relatórios Disponíveis</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-success">
                <div class="stat-icon">
                  <i class="mdi mdi-swap-horizontal"></i>
                </div>
                <div class="stat-content">
                  <h2 class="mb-0">4</h2>
                  <p class="mb-0">Movimentações</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-info">
                <div class="stat-icon">
                  <i class="mdi mdi-package-variant"></i>
                </div>
                <div class="stat-content">
                  <h2 class="mb-0">2</h2>
                  <p class="mb-0">Controle Estoque</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-warning">
                <div class="stat-icon">
                  <i class="mdi mdi-account-group"></i>
                </div>
                <div class="stat-content">
                  <h2 class="mb-0">1</h2>
                  <p class="mb-0">Gestão Pessoas</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Estoque Section -->
          <div class="reports-section mb-4">
            <div class="section-header">
              <div class="d-flex align-items-center">
                <div class="section-icon bg-success-subtle">
                  <i class="mdi mdi-package-variant text-success"></i>
                </div>
                <div>
                  <h5 class="mb-0 fw-bold">Controle de Estoque</h5>
                  <small class="text-muted">Visão consolidada do inventário</small>
                </div>
              </div>
            </div>
            <div class="row g-3 mt-2">
              <div class="col-md-6">
                <router-link to="/relatorios/estoque" class="report-card">
                  <div class="card-accent bg-success"></div>
                  <div class="report-icon bg-success-subtle">
                    <i class="mdi mdi-warehouse text-success"></i>
                  </div>
                  <div class="report-content">
                    <h6 class="fw-bold mb-1">Relatório de Estoque</h6>
                    <p class="text-muted small mb-2">
                      Visualize produtos, quantidades disponíveis, valores e status do estoque por unidade e setor
                    </p>
                    <div class="report-meta">
                      <span class="badge bg-success-subtle text-success me-2">
                        <i class="mdi mdi-file-excel me-1"></i>Excel
                      </span>
                      <span class="badge bg-success-subtle text-success">
                        <i class="mdi mdi-file-pdf-box me-1"></i>PDF
                      </span>
                    </div>
                  </div>
                  <div class="report-arrow">
                    <i class="mdi mdi-chevron-right"></i>
                  </div>
                </router-link>
              </div>
              <div class="col-md-6">
                <router-link to="/relatorios/entradas" class="report-card">
                  <div class="card-accent bg-success"></div>
                  <div class="report-icon bg-success-subtle">
                    <i class="mdi mdi-arrow-down-bold-circle text-success"></i>
                  </div>
                  <div class="report-content">
                    <h6 class="fw-bold mb-1">Entradas de Estoque</h6>
                    <p class="text-muted small mb-2">
                      Controle completo de entradas: fornecedores, notas fiscais, produtos e valores recebidos
                    </p>
                    <div class="report-meta">
                      <span class="badge bg-success-subtle text-success me-2">
                        <i class="mdi mdi-file-excel me-1"></i>Excel
                      </span>
                      <span class="badge bg-success-subtle text-success">
                        <i class="mdi mdi-file-pdf-box me-1"></i>PDF
                      </span>
                    </div>
                  </div>
                  <div class="report-arrow">
                    <i class="mdi mdi-chevron-right"></i>
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Movimentações Section -->
          <div class="reports-section mb-4">
            <div class="section-header">
              <div class="d-flex align-items-center">
                <div class="section-icon bg-primary-subtle">
                  <i class="mdi mdi-swap-horizontal text-primary"></i>
                </div>
                <div>
                  <h5 class="mb-0 fw-bold">Movimentações e Fluxo</h5>
                  <small class="text-muted">Transferências, saídas e distribuições</small>
                </div>
              </div>
            </div>
            <div class="row g-3 mt-2">
              <div class="col-md-6">
                <router-link to="/relatorios/movimentacoes" class="report-card">
                  <div class="card-accent bg-primary"></div>
                  <div class="report-icon bg-primary-subtle">
                    <i class="mdi mdi-swap-horizontal-bold text-primary"></i>
                  </div>
                  <div class="report-content">
                    <h6 class="fw-bold mb-1">Movimentações Gerais</h6>
                    <p class="text-muted small mb-2">
                      Todas as movimentações: transferências entre setores, saídas e devoluções do sistema
                    </p>
                    <div class="report-meta">
                      <span class="badge bg-primary-subtle text-primary me-2">
                        <i class="mdi mdi-file-excel me-1"></i>Excel
                      </span>
                      <span class="badge bg-primary-subtle text-primary">
                        <i class="mdi mdi-file-pdf-box me-1"></i>PDF
                      </span>
                    </div>
                  </div>
                  <div class="report-arrow">
                    <i class="mdi mdi-chevron-right"></i>
                  </div>
                </router-link>
              </div>
              <div class="col-md-6">
                <router-link to="/relatorios/saidas" class="report-card">
                  <div class="card-accent bg-primary"></div>
                  <div class="report-icon bg-primary-subtle">
                    <i class="mdi mdi-arrow-up-bold-circle text-primary"></i>
                  </div>
                  <div class="report-content">
                    <h6 class="fw-bold mb-1">Saídas de Estoque</h6>
                    <p class="text-muted small mb-2">
                      Controle de saídas: setores origem/destino, quantidades solicitadas e liberadas
                    </p>
                    <div class="report-meta">
                      <span class="badge bg-primary-subtle text-primary me-2">
                        <i class="mdi mdi-file-excel me-1"></i>Excel
                      </span>
                      <span class="badge bg-primary-subtle text-primary">
                        <i class="mdi mdi-file-pdf-box me-1"></i>PDF
                      </span>
                    </div>
                  </div>
                  <div class="report-arrow">
                    <i class="mdi mdi-chevron-right"></i>
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Análises Temporais Section -->
          <div class="reports-section mb-4">
            <div class="section-header">
              <div class="d-flex align-items-center">
                <div class="section-icon bg-info-subtle">
                  <i class="mdi mdi-chart-timeline-variant text-info"></i>
                </div>
                <div>
                  <h5 class="mb-0 fw-bold">Análises Temporais</h5>
                  <small class="text-muted">Relatórios agrupados por período</small>
                </div>
              </div>
            </div>
            <div class="row g-3 mt-2">
              <div class="col-md-6">
                <router-link to="/relatorios/entradas-por-data" class="report-card">
                  <div class="card-accent bg-info"></div>
                  <div class="report-icon bg-info-subtle">
                    <i class="mdi mdi-calendar-arrow-left text-info"></i>
                  </div>
                  <div class="report-content">
                    <h6 class="fw-bold mb-1">Entradas por Data</h6>
                    <p class="text-muted small mb-2">
                      Análise temporal de entradas: visualize padrões e tendências de recebimento por período
                    </p>
                    <div class="report-meta">
                      <span class="badge bg-info-subtle text-info me-2">
                        <i class="mdi mdi-file-excel me-1"></i>Excel
                      </span>
                      <span class="badge bg-info-subtle text-info">
                        <i class="mdi mdi-file-pdf-box me-1"></i>PDF
                      </span>
                    </div>
                  </div>
                  <div class="report-arrow">
                    <i class="mdi mdi-chevron-right"></i>
                  </div>
                </router-link>
              </div>
              <div class="col-md-6">
                <router-link to="/relatorios/saidas-por-data" class="report-card">
                  <div class="card-accent bg-info"></div>
                  <div class="report-icon bg-info-subtle">
                    <i class="mdi mdi-calendar-arrow-right text-info"></i>
                  </div>
                  <div class="report-content">
                    <h6 class="fw-bold mb-1">Saídas por Data</h6>
                    <p class="text-muted small mb-2">
                      Análise temporal de saídas: identifique picos de consumo e planeje reposições
                    </p>
                    <div class="report-meta">
                      <span class="badge bg-info-subtle text-info me-2">
                        <i class="mdi mdi-file-excel me-1"></i>Excel
                      </span>
                      <span class="badge bg-info-subtle text-info">
                        <i class="mdi mdi-file-pdf-box me-1"></i>PDF
                      </span>
                    </div>
                  </div>
                  <div class="report-arrow">
                    <i class="mdi mdi-chevron-right"></i>
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Gestão de Pessoas Section -->
          <div class="reports-section mb-4">
            <div class="section-header">
              <div class="d-flex align-items-center">
                <div class="section-icon bg-warning-subtle">
                  <i class="mdi mdi-account-group text-warning"></i>
                </div>
                <div>
                  <h5 class="mb-0 fw-bold">Gestão de Pessoas</h5>
                  <small class="text-muted">Usuários, vínculos e permissões</small>
                </div>
              </div>
            </div>
            <div class="row g-3 mt-2">
              <div class="col-md-6">
                <router-link to="/relatorios/usuarios" class="report-card">
                  <div class="card-accent bg-warning"></div>
                  <div class="report-icon bg-warning-subtle">
                    <i class="mdi mdi-account-multiple text-warning"></i>
                  </div>
                  <div class="report-content">
                    <h6 class="fw-bold mb-1">Relatório de Usuários</h6>
                    <p class="text-muted small mb-2">
                      Cadastro completo: usuários ativos, vínculos, setores vinculados e perfis de acesso
                    </p>
                    <div class="report-meta">
                      <span class="badge bg-warning-subtle text-warning me-2">
                        <i class="mdi mdi-file-excel me-1"></i>Excel
                      </span>
                      <span class="badge bg-warning-subtle text-warning">
                        <i class="mdi mdi-file-pdf-box me-1"></i>PDF
                      </span>
                    </div>
                  </div>
                  <div class="report-arrow">
                    <i class="mdi mdi-chevron-right"></i>
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Footer Info -->
          <div class="alert alert-light border mt-4">
            <div class="d-flex align-items-center">
              <i class="mdi mdi-information-outline text-primary fs-4 me-3"></i>
              <div>
                <strong>Exportação de Dados:</strong>
                Todos os relatórios suportam exportação nos formatos Excel (.xlsx) e PDF para distribuição e análise offline.
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

export default {
  name: 'RelatoriosIndex',
  components: { TemplateAdmin },
  computed: {
    totalRelatorios() {
      return 7;
    }
  }
}
</script>

<style scoped>
/* Header Section */
.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.header-section h3 {
  color: white;
}

.header-section .text-muted {
  color: rgba(255, 255, 255, 0.9) !important;
}

/* Stat Cards */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stat-primary {
  border-left-color: #667eea;
}

.stat-success {
  border-left-color: #28a745;
}

.stat-info {
  border-left-color: #17a2b8;
}

.stat-warning {
  border-left-color: #ffc107;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-success .stat-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.stat-info .stat-icon {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
}

.stat-warning .stat-icon {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
}

.stat-content h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0;
}

.stat-content p {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

/* Reports Section */
.reports-section {
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 1rem;
}

.section-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 1rem;
}

/* Report Cards */
.report-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: rgba(0, 0, 0, 0.1);
}

.report-card:hover .report-arrow {
  transform: translateX(5px);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.report-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.report-content {
  flex: 1;
}

.report-content h6 {
  color: #212529;
  margin-bottom: 0.5rem;
}

.report-content p {
  font-size: 0.875rem;
  line-height: 1.5;
}

.report-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.report-arrow {
  font-size: 24px;
  color: #6c757d;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

/* Bootstrap Subtle Backgrounds */
.bg-primary-subtle {
  background-color: rgba(102, 126, 234, 0.1) !important;
}

.bg-success-subtle {
  background-color: rgba(40, 167, 69, 0.1) !important;
}

.bg-info-subtle {
  background-color: rgba(23, 162, 184, 0.1) !important;
}

.bg-warning-subtle {
  background-color: rgba(255, 193, 7, 0.1) !important;
}

.text-primary {
  color: #667eea !important;
}

.text-success {
  color: #28a745 !important;
}

.text-info {
  color: #17a2b8 !important;
}

.text-warning {
  color: #ffc107 !important;
}

/* Badge Colors */
.badge.bg-success-subtle {
  background-color: rgba(40, 167, 69, 0.15) !important;
}

.badge.bg-primary-subtle {
  background-color: rgba(102, 126, 234, 0.15) !important;
}

.badge.bg-info-subtle {
  background-color: rgba(23, 162, 184, 0.15) !important;
}

.badge.bg-warning-subtle {
  background-color: rgba(255, 193, 7, 0.15) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .stat-content h2 {
    font-size: 1.5rem;
  }

  .report-card {
    flex-direction: column;
  }

  .report-arrow {
    align-self: flex-end;
  }

  .header-section {
    padding: 1.5rem;
  }

  .header-section h3 {
    font-size: 1.5rem;
  }
}
</style>
