import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.controllers.dispute_controller import router as dispute_router



load_dotenv()

app = FastAPI(
    title="IqAI API - Autonomous Dispute Agent",
    description="Backend para gestão autônoma de disputas com PayPal e IA",
    version="1.0.0"
)

# Configurar CORS para permitir comunicação com o Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "app": "IqAI API", "module": "MVC Ready"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
   
app.include_router(dispute_router)