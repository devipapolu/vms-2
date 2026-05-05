from fastapi import FastAPI, UploadFile, File
import uvicorn
import numpy as np
import time

app = FastAPI(title="VMS AI Service")

@app.get("/")
async def root():
    return {"message": "VMS AI Service is running"}

@app.post("/api/face/verify")
async def verify_face(file: UploadFile = File(...)):
    # Simulate OpenCV / FaceNet Pipeline
    print(f"📷 Processing image: {file.filename}")
    
    # 1. Face Detection & Cropping (Simulated)
    time.sleep(0.5) 
    print("✅ Face detected and cropped")
    
    # 2. Embedding Generation (Simulated 128-d vector)
    embedding = np.random.uniform(-1, 1, 128).tolist()
    print("✅ 128-d embedding generated via FaceNet")
    
    return {
        "status": "success",
        "embedding": embedding,
        "metadata": {
            "detection_confidence": 0.99,
            "processing_time_ms": 650
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
