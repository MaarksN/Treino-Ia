# Análise da Plataforma e Próximos 10 Passos Lógicos

Com base no registro de itens estratégicos da plataforma (`src/features/strategic-items/strategicItems.registry.ts`), identificamos que há 22 itens aguardando implementação ou refinamento (status diferente de `implemented_now`).

A plataforma divide os itens em horizontes: `now`, `next`, `future` e `later`.

Seguindo a lógica de evolução contínua e prioridade de horizonte, os próximos 10 passos lógicos para a plataforma são:

## Prioridade 1: Monetização (Horizonte: 'now')
Estes itens já possuem a fundação técnica criada (`foundation_created`) e focam em expandir as capacidades de geração de receita da plataforma.

1. **Item 61: Contrato de Ulisses / Cashback** (Monetization)
   - *Status atual:* foundation_created
   - *Objetivo:* Integrar com o Stripe para validar a devolução de valor (cashback) baseada no cumprimento de metas.

2. **Item 62: Marketplace de Planos** (Monetization)
   - *Status atual:* foundation_created
   - *Objetivo:* Finalizar o frontend e fluxo de pagamento (Stripe) para que usuários comprem/vendam planos de treino.

3. **Item 63: Pay-per-workout** (Monetization)
   - *Status atual:* foundation_created
   - *Objetivo:* Permitir a cobrança de microtransações por sessões de treino individuais ao invés de apenas assinaturas mensais.

## Prioridade 2: Inteligência Artificial Avançada (Horizonte: 'next')
Itens voltados para features disruptivas com IA, buscando enriquecer a experiência de treino.

4. **Item 51: AI Form Checker MediaPipe/WASM** (Advanced AI)
   - *Status atual:* foundation_created
   - *Objetivo:* Avançar o uso do WebAssembly e MediaPipe para fornecer feedback sonoro em tempo real de ângulos e postura do aluno.

5. **Item 56: Playlist Spotify por IA** (Advanced AI)
   - *Status atual:* blocked_external_dependency
   - *Objetivo:* Resolver a integração com a API do Spotify para criar e sincronizar playlists com base no tipo de treino e bpm da sessão.

## Prioridade 3: Hardware, IoT e AR (Horizonte: 'next')
Itens que conectam a plataforma física à virtual. A maioria está bloqueada ou com fundação criada.

6. **Item 66: NFC Tap-to-Set** (Hardware/AR/IoT)
   - *Status atual:* blocked_external_dependency
   - *Objetivo:* Integrar a API de Web NFC no frontend para que o usuário toque o celular e auto-preencha a carga dos equipamentos.

7. **Item 67: AR / WebXR** (Hardware/AR/IoT)
   - *Status atual:* foundation_created
   - *Objetivo:* Continuar o desenvolvimento da interface WebXR (hud e timer em Realidade Aumentada).

8. **Item 68: Oura / Ultrahuman** (Hardware/AR/IoT)
   - *Status atual:* blocked_external_dependency
   - *Objetivo:* Resolver a dependência de APIs externas dos anéis inteligentes para coletar recuperação neuromuscular.

9. **Item 69: Balanças via Web Bluetooth** (Hardware/AR/IoT)
   - *Status atual:* foundation_created
   - *Objetivo:* Integrar com a Web Bluetooth API para coletar peso e % de gordura diretamente das smart scales.

10. **Item 70: Tapete IoT** (Hardware/AR/IoT)
    - *Status atual:* blocked_external_dependency
    - *Objetivo:* Começar os testes de viabilidade de comunicação com hardware de tapetes sensíveis para levantamento de peso olímpico.

## Conclusão e Abordagem em Lotes
Para o próximo Lote (Lote 03), o foco deverá ser a **Monetização (Prioridade 1)**, finalizando os itens 61, 62 e 63, aproveitando que suas fundações já foram estabelecidas. Dependendo do espaço no lote (que tem um limite rígido de 5 itens por lote), a equipe pode avançar os primeiros itens do **Horizonte 'next'**, como a **AI Form Checker (Item 51)** e a integração **AR / WebXR (Item 67)**, por serem features de alto impacto visual e não dependerem diretamente de aprovações externas (diferente de Spotify e APIs Oura/Ultrahuman).
