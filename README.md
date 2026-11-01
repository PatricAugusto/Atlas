# Atlas

Bot de suporte técnico pelo Telegram, desenvolvido em TypeScript.

## Requisitos

- Node.js 20 ou superior
- Token de bot criado pelo [BotFather](https://telegram.me/BotFather)

## Desenvolvimento

```bash
npm install
Copy-Item .env.example .env
```

Preencha `TELEGRAM_BOT_TOKEN` no arquivo `.env` e execute:

```bash
npm run dev
```

O bot usa mensagens HTML suportadas pela Bot API do Telegram. Essa formatação permite negrito, itálico e links no chat; CSS e bibliotecas de interface não são aplicáveis às mensagens do Telegram.

## Estrutura

- `src/config`: leitura e validação de configuração.
- `src/features/support`: comandos e conteúdo da feature de suporte; cada componente mantém seus testes junto ao código.
- `src/bot`: composição do bot.
- `tests/suites`: testes de integração entre componentes.
- `tests/e2e`: fluxos completos do bot com a API do Telegram simulada.

## Testes e validações

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run typecheck
npm run build
```

Os testes E2E simulam as respostas da API do Telegram e não precisam de um token ou conexão externa.
