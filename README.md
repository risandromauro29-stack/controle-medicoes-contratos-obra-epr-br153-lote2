# Controle de Medições — Contratos de Obra

Dashboard BI para acompanhar contratos e medições mensais de obras (locações,
arrendamentos, prestação de serviços etc.), com KPIs, alertas automáticos,
filtros e gráficos, pronto para evoluir para múltiplas obras e, futuramente,
um backend real.

Dados de origem: planilha "Cópia de Controle de Medição Mensal", aba
`CONTRATO - MEDIÇÕES`.

## Rodando localmente

```bash
npm install
npm run dev
```

## Como funciona

- **Multi-obra**: a tela inicial (`/`) lista as obras; cada obra tem seu
  próprio painel (`/obra/:id`) e conjunto de contratos.
- **Dados**: hoje ficam em `localStorage` do navegador via
  `src/lib/store.ts`, atrás de uma interface `ObraRepository` — trocar para
  uma API/banco de dados real no futuro significa reimplementar essa
  interface, sem tocar nas telas.
- **Atualização mensal**: botão "Atualizar dados" no painel da obra permite
  subir uma nova planilha `.xlsx` no mesmo layout (colunas identificadas por
  nome de cabeçalho, incluindo os meses `jan-26`, `fev-26` etc.), que
  substitui os contratos daquela obra. O parser está em
  `src/lib/importSpreadsheet.ts`.
- **Filiais**: `156` é rotulada como "156 - PV" e `157` como "157 - FD
  (Faturamento Direto)". Editável em `src/pages/DashboardPage.tsx`
  (`DEFAULT_FILIAIS`).
- **Planejado x realizado**: o modelo de dados (`Contrato.planejado`) já tem
  o campo pronto para receber um cronograma físico-financeiro por mês assim
  que essa informação existir; o gráfico mensal desenha automaticamente a
  linha "Planejado" quando houver dados.
- **Alertas automáticos**: contrato com saldo negativo (estourado), saldo
  abaixo de 10% e contratos sem medição lançada há mais de 2 meses (baseado
  na data atual). Lógica em `src/lib/metrics.ts`.

## Marca

A logo real da Tucumann deve ser colocada em `public/logo.png` (não incluída
neste repositório). Sem o arquivo, a interface usa um monograma "T" como
placeholder.

## Stack

React + TypeScript + Vite + Tailwind CSS v4 + Recharts + SheetJS (`xlsx`).
