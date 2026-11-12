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

## 🚀 Como Executar o Projeto
You can run the application here at this address: https://i-qai.vercel.app/
Note: as the application is in the pilot phase, the address may not be available at all times!

### Pré-requisitos
- **Python 3.10+**
- **Node.js 18+** e `npm`
- Chave de API da **Groq** ([obter aqui](https://console.groq.com/))
- Credenciais da conta de desenvolvimento **PayPal Sandbox**

---

### 1. Configurar o Backend (FastAPI)

1. Navega para a pasta do backend:
   ```bash
   cd iqai-api
Cria e ativa um ambiente virtual:

Bash
python -m venv venv
# No Windows:
venv\Scripts\activate
# No Linux/macOS:
source venv/bin/activate
Instala as dependências:

Bash
pip install -r requirements.txt
Configura as variáveis de ambiente no ficheiro .env:

Fragmento do código

GROQ_API_KEY=tua_chave_groq_aqui
PAYPAL_CLIENT_ID=teu_client_id_sandbox
PAYPAL_CLIENT_SECRET=teu_client_secret_sandbox
PAYPAL_API_BASE=[https://api-m.sandbox.paypal.com](https://api-m.sandbox.paypal.com)

Inicia o servidor backend:
Bash
uvicorn main:app --reload --port 8000
O backend estará disponível em http://127.0.0.1:8000

A documentação Swagger UI estará disponível em http://127.0.0.1:8000/docs

2. Configurar o Frontend (Next.js)
Numa nova janela de terminal, navega para a pasta do frontend:

Bash
cd IqAI-frontend
Instala as dependências do Node.js:

Bash
npm install
Inicia o servidor de desenvolvimento:

Bash
npm run dev
O frontend estará disponível em http://localhost:3000
