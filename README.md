# 🤖 IqAI — Agente Autónomo de Litígios & Finanças PayPal

> **Sistema inteligente e autónomo de resolução de disputas financeiras no PayPal Sandbox, alimentado por LangGraph, Llama-3.3-70B (via Groq), FastAPI e Next.js.**

---

## 📌 Visão Geral

O **IqAI (FaQ-IA)** resolve a ineficiência e a morosidade no tratamento manual de litígios e disputas no PayPal. 

Em vez de depender de regras estáticas ou intervenção humana constante, o sistema utiliza um **agente autónomo baseado em grafos de decisão (LangGraph)**. O agente raciocina em tempo real sobre o motivo da disputa (`reason`), consulta a API do PayPal Sandbox e decide autonomamente entre:
1. **Contestar a disputa (`CONTEST`)** com provas de entrega/transação.
2. **Solicitar evidências ao comprador (`REQUEST_INFO`)** acionando ferramentas autónomas (*Tools / MCP*) para gerar links seguros de upload de fotos/vídeos.
3. **Escalar para intervenção humana (`ESCALATE`)** em casos de alto risco ou suspeita de fraude.

---


## 🛠️ Arquitetura do Sistema
![Arquitetura do IqAI (FaQ-IA)](./assets/arquitetura-iqai.jfif)

*O diagrama acima ilustra o fluxo de dados desde o painel em Next.js, passando pelo FastAPI, o motor de decisão em LangGraph com a Groq (Llama-3.3-70B), até à execução de ações no PayPal Sandbox e ferramentas autónomas (MCP).*

### 🧱 Componentes Principais
- **Frontend (`IqAI-frontend`)**: Interface interativa em **Next.js** e **Tailwind CSS** desenvolvida para permitir aos júris e operadores testar cenários dinâmicos (`dispute_id`, `order_id`, `reason`).
- **Backend (`iqai-api`)**: API em **FastAPI** que expõe endpoints estruturados com modelos Pydantic e validação de dados.
- **Grafo de Decisão (`LangGraph`)**: Motor de raciocínio lógico que faz a gestão de estados, nós condicionais e decisão do agente.
- **Motor de IA (`Groq`)**: Execução ultra-rápida do modelo open-source **`llama-3.3-70b-versatile`**.
- **Ferramentas (`Tools / MCP`)**: Capacidade do agente de invocar métodos externos autonomamente quando necessita de recolher provas do utilizador.

---

## 🚀 Como Executar

Pode testar a aplicação diretamente na versão em produção (quando disponível):
👉 **[https://i-qai.vercel.app/](https://i-qai.vercel.app/)**  
*(Observação: Como o projeto se encontra em fase piloto num ambiente gratuito, o servidor backend no Render pode demorar alguns segundos a acordar no primeiro acesso).*

---
Executar no localhost
### Pré-requisitos
- Python 3.10+
- Node.js 18+ e `npm`
- Chave de API da Groq ([obtenha aqui](https://console.groq.com/))
- Credenciais de uma conta de programador PayPal Sandbox (Client ID e Client Secret)

---

### 1. Configurar o Back-end (FastAPI)

1. Navegue para a pasta do backend:
   ```bash
   cd iqai-api
## Crie e ative ambiente virtual
 - python -m venv venv
 - venv\Scripts\activate

## Instale as dependências:
 - pip install -r requirements.txt
## Configure as variáveis de ambiente criando um ficheiro .env na raiz da pasta iqai-api:
 - GROQ_API_KEY=tua_chave_groq_aqui
 - PAYPAL_CLIENT_ID=teu_client_id_sandbox
 - PAYPAL_CLIENT_SECRET=teu_client_secret_sandbox
 - PAYPAL_API_BASE=[https://api-m.sandbox.paypal.com](https://api-m.sandbox.paypal.com)

## Inicie o servidor do backend:
 - uvicorn main:app --reload --port 8000

## O backend ficará disponível em http://127.0.0.1:8000

## A documentação interativa (Swagger UI) pode ser acedida em http://127.0.0.1:8000/docs

## Configurar o Front-end (Next.js)
 # Numa nova janela do terminal, navegue até a pasta do frontend:
 - cd IqAI-frontend
## Instale as dependências do Node.js:
 - npm install

## Inicie o servidor de desenvolvimento:
 - npm run dev
 # O frontend estará disponível em http://localhost:3000

 ### 3\. Configurar os Webhooks no PayPal Developer (Simulador & Produção)

Para que o agente autónomo receba notificações em tempo real quando ocorrem litígios na Sandbox:

1.  Aceda ao [PayPal Developer Dashboard](https://developer.paypal.com/).

2.  Vá a **Apps & Credentials** e selecione a sua aplicação Sandbox.

3.  Deslize até à secção **Webhooks** e clique em **Add Webhook** (ou edite o webhook existente).

4.  Insira o URL de callback oficial do seu backend alojado no Render:

    Plaintext

    ```plaintext
    [https://iqai-n0m8.onrender.com/api/disputes/webhook/paypal](https://iqai-n0m8.onrender.com/api/disputes/webhook/paypal)
    ```

5.  Nos **Event types** (tipos de eventos subscritos), certifique-se de selecionar pelo menos **`Customer dispute created`** e outros eventos relacionados com litígios (`Customer dispute resolved`, etc.).

6.  **Como testar:** Utilize a ferramenta **Webhook Simulator** do PayPal para disparar eventos de teste para o seu backend na nuvem e ver o agente processar os dados autonomamente em segundo plano, com os logs refletidos instantaneamente na interface web.
