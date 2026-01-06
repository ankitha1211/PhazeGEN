from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Import the new pipeline from the ml_engine folder
from ml_engine.pipeline.main_pipeline import run_analysis_pipeline

app = FastAPI(title="PhazeGEN API", version="1.0.0")

# CORS Setup for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextPayload(BaseModel):
    sequence: str

@app.get("/")
def read_root():
    return {"status": "PhazeGEN API Active", "version": "1.0.0"}

@app.post("/analyze/text")
def analyze_text(payload: TextPayload):
    try:
        # Pass the raw sequence directly to the pipeline
        results = run_analysis_pipeline(payload.sequence)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/file")
async def analyze_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        decoded_content = content.decode("utf-8")
        
        # The pipeline handles parsing, so we pass the raw content
        results = run_analysis_pipeline(decoded_content)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)