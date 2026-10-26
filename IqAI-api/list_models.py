import os
from dotenv import load_dotenv
from groq import Groq

# Carregar variáveis do ficheiro .env
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    print("❌ GROQ_API_KEY não foi encontrada no ficheiro .env")
    exit(1)

try:
    client = Groq(api_key=GROQ_API_KEY)
    models = client.models.list()
    
    print("\n✅ Modelos disponíveis na tua conta Groq:\n")
    print(f"{'ID DO MODELO':<35} | {'DESENVOLVEDOR':<15}")
    print("-" * 55)
    
    for model in models.data:
        print(f"{model.id:<35} | {model.owned_by:<15}")
        
    print("\n💡 Dica: Escolhe um dos IDs acima para colocar no dispute_service.py\n")

except Exception as e:
    print(f"❌ Erro ao listar modelos da Groq: {e}")
    