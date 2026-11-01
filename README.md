# Atlas

Bot de suporte técnico pelo Telegram, desenvolvido em TypeScript.

## Requisitos

- Node.js 20 ou superior
- Token de bot criado pelo [BotFather](https://telegram.me/BotFather)

## Desenvolvimento

```bash
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Preencha `TELEGRAM_BOT_TOKEN` no arquivo `.env` e execute:

```bash
npm run dev
```

O modo de desenvolvimento executa TypeScript diretamente e reinicia ao detectar alterações no código. Para executar a versão compilada, use `npm start`; esse comando compila o projeto antes de iniciá-lo. Se o Telegram responder `getMe: 404`, gere um novo token ou copie-o novamente no @BotFather e atualize `TELEGRAM_BOT_TOKEN` no `.env`. Nunca compartilhe esse token.

## Simulações com personas e LLMs

As personas simulam clientes que trazem problemas técnicos cotidianos para que a equipe possa praticar o atendimento. O modelo responde como cliente, mantém o contexto da conversa e não assume o papel de suporte.

Adicione ao `.env` a URL compatível com OpenAI, o modelo e, quando necessário, a chave da API:

```env
LLM_API_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=sua-chave-do-provedor
LLM_MODEL=qwen/qwen3-32b
```

O cliente usa o endpoint `/chat/completions`, permitindo trocar de provedor/modelo pela configuração. Exemplos de IDs para provedores compatíveis incluem `qwen/qwen3-32b`, `meta-llama/llama-3.3-70b-instruct` e `deepseek/deepseek-r1-0528`; confirme quais estão disponíveis no seu provedor. Também são aceitos endpoints locais OpenAI-compatible do Ollama. Para Ollama, inicie um modelo local, por exemplo `ollama run qwen3:8b`, e configure:

```env
LLM_API_BASE_URL=http://localhost:11434/v1
LLM_MODEL=qwen3:8b
```

O campo `LLM_API_KEY` é opcional para provedores locais. Confira a disponibilidade e o identificador atual de cada modelo no provedor escolhido. Nunca compartilhe chaves de API.

As mensagens da simulação são enviadas ao provedor configurado. Use somente cenários e dados fictícios; não envie senhas, códigos de autenticação ou dados reais de clientes.

No Telegram, envie `/personas` para ver os cenários, `/persona impressora` (ou outro ID listado) para iniciar uma simulação e `/encerrar` para finalizá-la. `/ajuda` mostra os comandos. Conversas ficam em memória e são isoladas por chat; reiniciar o bot limpa as sessões. Sem configuração LLM, comandos de suporte e listagem de personas continuam disponíveis, mas não é possível iniciar simulações.

O bot usa mensagens HTML suportadas pela Bot API do Telegram. Essa formatação permite negrito, itálico e links no chat; CSS e bibliotecas de interface não são aplicáveis às mensagens do Telegram.

## Estrutura

- `src/config`: leitura e validação de configuração.
- `src/features/support`: comandos e conteúdo da feature de suporte; cada componente mantém seus testes junto ao código.
- `src/features/personas`: catálogo de clientes simulados, histórico por chat, roteamento e cliente para APIs de LLM.
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
