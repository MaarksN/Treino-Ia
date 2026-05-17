import { type StrategicItem } from './strategicItems.types';

export const strategicItemsRegistry: StrategicItem[] = [
  {
    "id": 1,
    "title": "Desacoplar componentes grandes do dashboard",
    "category": "engineering",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "engineering",
    "implementationNotes": "Lógica de sessão ativa, starter user e draft de treino extraída para services testáveis integrados ao Dashboard."
  },
  {
    "id": 2,
    "title": "Roteador moderno incremental",
    "category": "engineering",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "medium",
    "productArea": "navigation",
    "implementationNotes": "Router adapter incremental normaliza rotas do Dashboard e deep link de nutricao sem trocar a arquitetura atual nem adicionar dependencia."
  },
  {
    "id": 3,
    "title": "Offline handlers e fila IndexedDB segura",
    "category": "engineering",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "engineering",
    "implementationNotes": "Fila offline preserva IndexedDB e adiciona fallback local seguro, contagem, update/remove e testes sem exigir schema novo."
  },
  {
    "id": 4,
    "title": "Preparar lazy loading seguro por rota",
    "category": "engineering",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "engineering",
    "implementationNotes": "Bootstrap do App reduzido e Dashboard/Onboarding/Registration carregados via lazy/Suspense sem alterar fluxos validados."
  },
  {
    "id": 5,
    "title": "Testes E2E smoke",
    "category": "engineering",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "medium",
    "productArea": "quality",
    "implementationNotes": "Smoke E2E viavel em Vitest/jsdom cobre deep link, persistencia local de perfil, plano e historico sem instalar Playwright/Cypress."
  },
  {
    "id": 6,
    "title": "CI paralelo",
    "category": "engineering",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "medium",
    "productArea": "ci",
    "implementationNotes": "GitHub Actions separado em jobs paralelizaveis para lint, typecheck, testes e build, cada um com instalacao limpa."
  },
  {
    "id": 7,
    "title": "Cache Gemini",
    "category": "engineering",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "medium",
    "productArea": "ai-platform",
    "implementationNotes": "Cache em memoria com TTL integrado ao proxy Gemini para prompts textuais; payloads multimodais nao sao cacheados e nenhum Redis fake foi criado."
  },
  {
    "id": 8,
    "title": "Migracao JSONB progressiva",
    "category": "engineering",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "data-architecture",
    "implementationNotes": "Read-models e mapeadores JSONB integrados a profile, plano e historico, sem criar migration ou alterar schema Supabase."
  },
  {
    "id": 9,
    "title": "Validação Zod granular para inputs críticos",
    "category": "engineering",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "engineering",
    "implementationNotes": "Schemas Zod validam anamnese e métricas de séries antes de persistir perfil ou finalizar treino ativo."
  },
  {
    "id": 10,
    "title": "Reduzir renderizações supérfluas",
    "category": "engineering",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "engineering",
    "implementationNotes": "Handlers críticos foram estabilizados com useCallback/useMemo e componentes Dashboard recorrentes foram memoizados pontualmente."
  },
  {
    "id": 11,
    "title": "Progresso visual na geracao de plano",
    "category": "ui_ux",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "ui-ux",
    "implementationNotes": "Codigo e UI criados para progresso visual real no fluxo de anamnese e recalculo local; promocao pendente de validacao completa."
  },
  {
    "id": 12,
    "title": "Microinteracoes e animacoes leves",
    "category": "ui_ux",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "ui-ux",
    "implementationNotes": "Microinteracoes leves criadas em selecao de dias, cards, historico e conclusao de series/exercicios; promocao pendente de validacao completa."
  },
  {
    "id": 13,
    "title": "Contraste alto/WCAG em UI crítica",
    "category": "ui_ux",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "ui-ux",
    "implementationNotes": "Helpers WCAG aplicados em ações e estados críticos do Dashboard/treino ativo, com testes de contraste."
  },
  {
    "id": 14,
    "title": "Haptic feedback nativo seguro",
    "category": "ui_ux",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "ui-ux",
    "implementationNotes": "Adapter seguro usa Capacitor Haptics quando disponível e navigator.vibrate como fallback, integrado a ações do treino ativo."
  },
  {
    "id": 15,
    "title": "Gestos/swipe no treino ativo",
    "category": "ui_ux",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "ui-ux",
    "implementationNotes": "Swipe horizontal seguro navega entre exercícios sem capturar inputs, labels, botões ou rolagem vertical."
  },
  {
    "id": 16,
    "title": "Base de navegação mobile/PWA",
    "category": "ui_ux",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "ui-ux",
    "implementationNotes": "Bottom navigation mobile integrada a secoes reais do Dashboard sem trocar roteador; promocao pendente de validacao completa."
  },
  {
    "id": 17,
    "title": "Skeleton loaders reais",
    "category": "ui_ux",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "ui-ux",
    "implementationNotes": "Dashboard inicial passa a usar skeletons estruturais para perfil, metricas, plano e historico; promocao pendente de validacao completa."
  },
  {
    "id": 18,
    "title": "Customização de tema premium",
    "category": "ui_ux",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "ui-ux",
    "implementationNotes": "Guard de tema premium bloqueia aplicação local sem entitlement, preservando base de customização sem fingir billing."
  },
  {
    "id": 19,
    "title": "Picture-in-picture áudio/vídeo",
    "category": "ui_ux",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "ui-ux",
    "implementationNotes": "Guard PiP detecta suporte e mídia real antes de renderizar controle; nenhum player fake foi criado."
  },
  {
    "id": 20,
    "title": "Reordenação drag & drop de exercícios",
    "category": "active_workout",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "workout-authoring",
    "implementationNotes": "Reordenação local funcional no plano semanal, com drag and drop, botões de fallback, persistência do plano atual e testes de serviço."
  },
  {
    "id": 21,
    "title": "Base de cronômetro de descanso",
    "category": "ui_ux",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "ui-ux",
    "implementationNotes": "Implementado nesta fase com código executável."
  },
  {
    "id": 22,
    "title": "Autofill por histórico recente",
    "category": "active_workout",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "active-workout",
    "implementationNotes": "Implementado nesta fase com código executável."
  },
  {
    "id": 23,
    "title": "Detecção simples de platô",
    "category": "active_workout",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "active-workout",
    "implementationNotes": "Implementado nesta fase com código executável."
  },
  {
    "id": 24,
    "title": "Cálculo de tonelagem reutilizável",
    "category": "active_workout",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "active-workout",
    "implementationNotes": "Implementado nesta fase com código executável."
  },
  {
    "id": 25,
    "title": "Feedback por câmera com guard MediaPipe",
    "category": "hardware_ar_iot",
    "status": "blocked_external_dependency",
    "horizon": "future",
    "risk": "high",
    "productArea": "workout-media",
    "implementationNotes": "Adapter/guard criado e integrado ao treino ativo; bloqueia honestamente quando camera segura, getUserMedia ou MediaPipe Pose nao estão disponíveis."
  },
  {
    "id": 26,
    "title": "Supersets e dropsets nativos locais",
    "category": "active_workout",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "workout-authoring",
    "implementationNotes": "Modelo local em JSON do plano, UI de técnica por exercício, chips no treino ativo, persistência no plano atual e testes de regras."
  },
  {
    "id": 27,
    "title": "Anotações por exercício",
    "category": "active_workout",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "workout-authoring",
    "implementationNotes": "Notas textuais por exercício no plano e no treino ativo, persistidas no log; audio fica apenas com guard de suporte sem simular gravação."
  },
  {
    "id": 28,
    "title": "Importação por imagem/PDF com crop seguro",
    "category": "active_workout",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "workout-media",
    "implementationNotes": "Pipeline local de arquivo e crop criado para imagem/PDF, integrado ao Dashboard; OCR permanece bloqueado por não haver integração real neste lote."
  },
  {
    "id": 29,
    "title": "Helper de RPE",
    "category": "active_workout",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "active-workout",
    "implementationNotes": "Implementado nesta fase com código executável."
  },
  {
    "id": 30,
    "title": "Sugestões de progressão de carga",
    "category": "active_workout",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "active-workout",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 31,
    "title": "Correlação sono x força",
    "category": "nutrition_recovery",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "nutrition-recovery",
    "implementationNotes": "Card no Dashboard com registro local de sono, service de correlacao e fallback honesto para amostra insuficiente."
  },
  {
    "id": 32,
    "title": "Check-in de dor",
    "category": "nutrition_recovery",
    "status": "existing_supported",
    "horizon": "now",
    "risk": "low",
    "productArea": "nutrition-recovery",
    "implementationNotes": "Mapa corporal simples no Dashboard com regioes, intensidade 0-10 e persistencia local; promocao para implemented_now pendente de validacao completa."
  },
  {
    "id": 33,
    "title": "Diário de água persistente na tela de bloqueio",
    "category": "nutrition_recovery",
    "status": "existing_supported",
    "horizon": "now",
    "risk": "medium",
    "productArea": "nutrition-recovery",
    "implementationNotes": "Atalhos PWA e ações de notificação registram água via bridge para o diário local."
  },
  {
    "id": 34,
    "title": "Recomendação nutricional dinâmica",
    "category": "nutrition_recovery",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "medium",
    "productArea": "nutrition-recovery",
    "implementationNotes": "Serviço considera fadiga, hidratação e ciclo hormonal para ajustar pré-treino e intensidade."
  },
  {
    "id": 35,
    "title": "Integração de receitas com lista de mercado",
    "category": "nutrition_recovery",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "medium",
    "productArea": "nutrition-recovery",
    "implementationNotes": "Seleção de receitas por macros com query de API externa e agregação automática de compras."
  },
  {
    "id": 36,
    "title": "Registro de cafeína",
    "category": "nutrition_recovery",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "nutrition-recovery",
    "implementationNotes": "Tracker de cafeina no Dashboard com presets, dose customizada, estimativa de impacto no sono e persistencia local."
  },
  {
    "id": 37,
    "title": "Modo recuperação/day off",
    "category": "nutrition_recovery",
    "status": "existing_supported",
    "horizon": "now",
    "risk": "low",
    "productArea": "nutrition-recovery",
    "implementationNotes": "Card de day off/recuperacao baseado em historico de RPE, dor e cafeina locais; promocao para implemented_now pendente de validacao completa."
  },
  {
    "id": 38,
    "title": "Tracking do ciclo menstrual",
    "category": "nutrition_recovery",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "medium",
    "productArea": "nutrition-recovery",
    "implementationNotes": "Tracker de ciclo conectado à recomendação de treino/nutrição do painel de lifestyle."
  },
  {
    "id": 39,
    "title": "Sobrecarga por RPE acumulado",
    "category": "nutrition_recovery",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "nutrition-recovery",
    "implementationNotes": "Metrica de carga interna por RPE acumulado dos ultimos 7 dias integrada ao Dashboard com niveis de risco."
  },
  {
    "id": 40,
    "title": "Scan de refeição",
    "category": "nutrition_recovery",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "medium",
    "productArea": "nutrition-recovery",
    "implementationNotes": "Upload de foto usa Gemini Vision para estimar macros e gerar veredito frente às metas."
  },
  {
    "id": 41,
    "title": "Leaderboard por consistência local",
    "category": "gamification_retention",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "gamification-retention",
    "implementationNotes": "Implementado no Dashboard com ranking pessoal por semanas, usando score de consistência local sem fingir leaderboard global."
  },
  {
    "id": 42,
    "title": "Badges de estilo de vida",
    "category": "gamification_retention",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "gamification-retention",
    "implementationNotes": "Implementado no Dashboard com badges locais conquistados e em progresso derivados do histórico de treino."
  },
  {
    "id": 43,
    "title": "Recompensa por consistência",
    "category": "gamification_retention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "gamification-retention",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 44,
    "title": "Base de streak freeze",
    "category": "gamification_retention",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "gamification-retention",
    "implementationNotes": "Implementado no Dashboard com regra local de freeze para descanso legítimo, sem paywall e sem backend novo."
  },
  {
    "id": 45,
    "title": "Relatorio mensal/anual",
    "category": "gamification_retention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "gamification-retention",
    "implementationNotes": "Relatorio mensal/anual visivel criado no Dashboard com metricas de sessoes, volume, aderencia, foco e tempo ativo; promocao pendente de validacao completa."
  },
  {
    "id": 46,
    "title": "Ranking pessoal por blocos",
    "category": "gamification_retention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "gamification-retention",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 47,
    "title": "Títulos de perfil por nível",
    "category": "gamification_retention",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "gamification-retention",
    "implementationNotes": "Implementado no Dashboard com service de títulos por nível local e badge junto ao nome do perfil."
  },
  {
    "id": 48,
    "title": "Feedback de meta batida",
    "category": "gamification_retention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "gamification-retention",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 49,
    "title": "Plano de retorno após pausa",
    "category": "gamification_retention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "gamification-retention",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 50,
    "title": "Base de missões diárias",
    "category": "gamification_retention",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "gamification-retention",
    "implementationNotes": "Implementado no Dashboard com missões diárias escondidas geradas por data e progresso real do histórico local."
  },
  {
    "id": 51,
    "title": "AI Form Checker MediaPipe/WASM",
    "category": "advanced_ai",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "advanced-ai",
    "implementationNotes": "Adapter seguro criado. Aguardando integração de biblioteca."
  },
  {
    "id": 52,
    "title": "Gêmeo digital biomecânico",
    "category": "advanced_ai",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "advanced-ai",
    "implementationNotes": "Visão educacional simples e sem claims clínicos."
  },
  {
    "id": 53,
    "title": "Coach por voz TTS/Web Speech",
    "category": "advanced_ai",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "advanced-ai",
    "implementationNotes": "Adapter seguro para Web Speech com fallback em texto."
  },
  {
    "id": 54,
    "title": "Pain-Driven Redesign",
    "category": "advanced_ai",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "advanced-ai",
    "implementationNotes": "Sugestões locais de cuidado sem alterar plano."
  },
  {
    "id": 55,
    "title": "Personalidade da IA",
    "category": "advanced_ai",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "advanced-ai",
    "implementationNotes": "Configuração local de tom sem chamada LLM obrigatória."
  },
  {
    "id": 56,
    "title": "Playlist Spotify por IA",
    "category": "advanced_ai",
    "status": "blocked_external_dependency",
    "horizon": "next",
    "risk": "medium",
    "productArea": "advanced-ai",
    "implementationNotes": "Integration guard added. Real OAuth required."
  },
  {
    "id": 57,
    "title": "RPE por microexpressão facial",
    "category": "advanced_ai",
    "status": "deferred_high_risk",
    "horizon": "later",
    "risk": "high",
    "productArea": "advanced-ai",
    "implementationNotes": "Research flag and protection created."
  },
  {
    "id": 58,
    "title": "Replanejamento por foto de equipamentos",
    "category": "advanced_ai",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "advanced-ai",
    "implementationNotes": "Safe upload flow/guard created."
  },
  {
    "id": 59,
    "title": "Despensa inteligente",
    "category": "advanced_ai",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "advanced-ai",
    "implementationNotes": "Local model for ingredients/manual created."
  },
  {
    "id": 60,
    "title": "Projeção de longevidade",
    "category": "advanced_ai",
    "status": "foundation_created",
    "horizon": "later",
    "risk": "high",
    "productArea": "advanced-ai",
    "implementationNotes": "Consistency indicator guard created."
  },
  {
    "id": 61,
    "title": "Paywall por trilhas premium",
    "category": "monetization",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "monetization",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 62,
    "title": "Marketplace de protocolos",
    "category": "monetization",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "monetization",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 63,
    "title": "Assinatura de planos especializados",
    "category": "monetization",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "monetization",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 64,
    "title": "Carteira de créditos de IA",
    "category": "monetization",
    "status": "deferred_high_risk",
    "horizon": "later",
    "risk": "high",
    "productArea": "monetization",
    "implementationNotes": "Adiado por risco alto nesta fase."
  },
  {
    "id": 65,
    "title": "Programa de afiliados",
    "category": "monetization",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "monetization",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 66,
    "title": "NFC Tap-to-Set",
    "category": "hardware_ar_iot",
    "status": "blocked_external_dependency",
    "horizon": "next",
    "risk": "medium",
    "productArea": "hardware-ar-iot",
    "implementationNotes": "Adapter criado, aguardando hardware e Web NFC."
  },
  {
    "id": 67,
    "title": "AR/WebXR",
    "category": "hardware_ar_iot",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "hardware-ar-iot",
    "implementationNotes": "Capability detection adicionada. Interface bloqueada até device suportado."
  },
  {
    "id": 68,
    "title": "Oura/Ultrahuman",
    "category": "hardware_ar_iot",
    "status": "blocked_external_dependency",
    "horizon": "next",
    "risk": "medium",
    "productArea": "hardware-ar-iot",
    "implementationNotes": "Provider contract criado. Aguardando OAuth."
  },
  {
    "id": 69,
    "title": "Balanças via Web Bluetooth",
    "category": "hardware_ar_iot",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "hardware-ar-iot",
    "implementationNotes": "Capability guard adicionado. Integração pendente de device."
  },
  {
    "id": 70,
    "title": "Tapete IoT",
    "category": "hardware_ar_iot",
    "status": "blocked_external_dependency",
    "horizon": "next",
    "risk": "medium",
    "productArea": "hardware-ar-iot",
    "implementationNotes": "Interface provider criada. Adiado por risco e dependência."
  },
  {
    "id": 71,
    "title": "Integração com wearables BLE",
    "category": "hardware_ar_iot",
    "status": "blocked_external_dependency",
    "horizon": "future",
    "risk": "high",
    "productArea": "hardware-ar-iot",
    "implementationNotes": "Dependente de integração externa/hardware/credenciais."
  },
  {
    "id": 72,
    "title": "Scanner NFC de equipamentos",
    "category": "hardware_ar_iot",
    "status": "blocked_external_dependency",
    "horizon": "future",
    "risk": "high",
    "productArea": "hardware-ar-iot",
    "implementationNotes": "Dependente de integração externa/hardware/credenciais."
  },
  {
    "id": 73,
    "title": "Visão computacional com câmera",
    "category": "hardware_ar_iot",
    "status": "blocked_external_dependency",
    "horizon": "future",
    "risk": "high",
    "productArea": "hardware-ar-iot",
    "implementationNotes": "Dependente de integração externa/hardware/credenciais."
  },
  {
    "id": 74,
    "title": "WebXR para execução técnica",
    "category": "hardware_ar_iot",
    "status": "blocked_external_dependency",
    "horizon": "future",
    "risk": "high",
    "productArea": "hardware-ar-iot",
    "implementationNotes": "Dependente de integração externa/hardware/credenciais."
  },
  {
    "id": 75,
    "title": "Sincronização Oura/Ultrahuman",
    "category": "hardware_ar_iot",
    "status": "blocked_external_dependency",
    "horizon": "future",
    "risk": "high",
    "productArea": "hardware-ar-iot",
    "implementationNotes": "Dependente de integração externa/hardware/credenciais."
  },
  {
    "id": 76,
    "title": "Co-op workouts remotos",
    "category": "social_community",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "social-community",
    "implementationNotes": "Guarda UI para modo co-op remoto."
  },
  {
    "id": 77,
    "title": "Death penalty virtual",
    "category": "gamification_retention",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "gamification-retention",
    "implementationNotes": "Guarda visual para modo extremo (opcional)."
  },
  {
    "id": 78,
    "title": "Modo roguelike",
    "category": "gamification_retention",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "gamification-retention",
    "implementationNotes": "Desbloqueado com base no histórico."
  },
  {
    "id": 79,
    "title": "Drops cosméticos",
    "category": "gamification_retention",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "gamification-retention",
    "implementationNotes": "Drops locais baseados no histórico."
  },
  {
    "id": 80,
    "title": "Pets musculares",
    "category": "gamification_retention",
    "status": "implemented_now",
    "horizon": "now",
    "risk": "low",
    "productArea": "gamification-retention",
    "implementationNotes": "Saúde e felicidade do pet baseada na rotina de treinos."
  },
  {
    "id": 81,
    "title": "Feed social com desafios",
    "category": "social_community",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "social-community",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 82,
    "title": "Guildas por objetivo",
    "category": "social_community",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "social-community",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 83,
    "title": "Match de parceiros de treino",
    "category": "social_community",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "social-community",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 84,
    "title": "Leaderboard geolocalizado",
    "category": "social_community",
    "status": "blocked_external_dependency",
    "horizon": "future",
    "risk": "high",
    "productArea": "social-community",
    "implementationNotes": "Dependente de integração externa/hardware/credenciais."
  },
  {
    "id": 85,
    "title": "Compartilhamento de marcos",
    "category": "social_community",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "social-community",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 86,
    "title": "Co-op em tempo real",
    "category": "social_community",
    "status": "blocked_external_dependency",
    "horizon": "future",
    "risk": "high",
    "productArea": "social-community",
    "implementationNotes": "Dependente de integração externa/hardware/credenciais."
  },
  {
    "id": 87,
    "title": "Eventos de comunidade",
    "category": "social_community",
    "status": "deferred_high_risk",
    "horizon": "later",
    "risk": "high",
    "productArea": "social-community",
    "implementationNotes": "Adiado por risco alto nesta fase."
  },
  {
    "id": 88,
    "title": "Mentoria entre atletas",
    "category": "social_community",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "social-community",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 89,
    "title": "Reações em sessões",
    "category": "social_community",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "social-community",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 90,
    "title": "Clubes privados",
    "category": "social_community",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "social-community",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 91,
    "title": "Trilhas para iniciantes",
    "category": "injury_prevention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "injury-prevention",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 92,
    "title": "Modo alto contraste total",
    "category": "injury_prevention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "injury-prevention",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 93,
    "title": "Navegação por leitor de tela",
    "category": "injury_prevention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "injury-prevention",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 94,
    "title": "Protocolos para PCD",
    "category": "injury_prevention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "injury-prevention",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 95,
    "title": "Linguagem simples guiada",
    "category": "injury_prevention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "injury-prevention",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 96,
    "title": "Ajustes por idade",
    "category": "injury_prevention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "injury-prevention",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 97,
    "title": "Segurança para pós-lesão",
    "category": "injury_prevention",
    "status": "foundation_created",
    "horizon": "next",
    "risk": "medium",
    "productArea": "injury-prevention",
    "implementationNotes": "Base técnica criada para evolução incremental."
  },
  {
    "id": 98,
    "title": "Relatórios para profissionais de saúde",
    "category": "injury_prevention",
    "status": "blocked_external_dependency",
    "horizon": "future",
    "risk": "high",
    "productArea": "injury-prevention",
    "implementationNotes": "Dependente de integração externa/hardware/credenciais."
  },
  {
    "id": 99,
    "title": "Compliance e consentimento clínico",
    "category": "injury_prevention",
    "status": "deferred_high_risk",
    "horizon": "later",
    "risk": "high",
    "productArea": "injury-prevention",
    "implementationNotes": "Adiado por risco alto nesta fase."
  },
  {
    "id": 100,
    "title": "Modo pesquisa experimental",
    "category": "accessibility_inclusion",
    "status": "deferred_high_risk",
    "horizon": "later",
    "risk": "high",
    "productArea": "accessibility-inclusion",
    "implementationNotes": "Adiado por risco alto nesta fase."
  }
];
