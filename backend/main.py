from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime
from supabase import create_client, Client
import logging
import sys

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Satyasodhak API",
             description="API for fact-checking and claims verification",
             version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
try:
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")  # Changed from SUPABASE_KEY to SUPABASE_SERVICE_ROLE_KEY
    
    if not url or not key:
        raise ValueError("Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    
    logger.info("Initializing Supabase client...")
    supabase: Client = create_client(url, key)
    logger.info("Successfully initialized Supabase client")
    
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {str(e)}")
    logger.error("Please check your .env file and ensure it contains valid SUPABASE_URL and SUPABASE_KEY")
    # Don't exit here, as we might be running in an environment where Supabase is not required for all endpoints
    supabase = None

def format_claim(claim):
    """Helper function to format claim data"""
    if not claim:
        return None
        
    # Convert datetime objects to ISO format strings if they're not already
    if 'created_at' in claim and claim['created_at']:
        if hasattr(claim['created_at'], 'isoformat'):
            claim['created_at'] = claim['created_at'].isoformat()
    
    if 'updated_at' in claim and claim.get('updated_at'):
        if hasattr(claim['updated_at'], 'isoformat'):
            claim['updated_at'] = claim['updated_at'].isoformat()
    
    # Ensure all required fields exist
    claim.setdefault('tags', [])
    claim.setdefault('verdict', 'pending')
    claim.setdefault('summary', '')
    claim.setdefault('title', 'Untitled Claim')
    
    return claim

@app.get("/api/claims")
async def get_claims(request: Request):
    """
    Fetch all claims from the database with enhanced error handling and CORS support.
    """
    # CORS headers
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
    }
    
    try:
        # Handle preflight requests
        if request.method == "OPTIONS":
            return Response(status_code=204, headers=headers)
            
        # Check if Supabase is initialized
        if supabase is None:
            error_msg = "Supabase client not initialized. Check your environment variables."
            logger.error(error_msg)
            return JSONResponse(
                status_code=500,
                content={"detail": error_msg},
                headers=headers
            )
            
        logger.info("Fetching claims from Supabase...")
        
        # Fetch data from Supabase with error handling
        try:
            response = supabase.table('claims').select("*").execute()
        except Exception as e:
            error_msg = f"Supabase query failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return JSONResponse(
                status_code=500,
                content={"detail": error_msg},
                headers=headers
            )
        
        # Process response
        if hasattr(response, 'data') and isinstance(response.data, list):
            logger.info(f"Successfully retrieved {len(response.data)} claims")
            formatted_claims = [format_claim(claim) for claim in response.data if claim]
            
            return JSONResponse(
                content=formatted_claims,
                headers=headers,
                status_code=200
            )
        else:
            logger.warning("No claims found or invalid response format")
            return JSONResponse(
                content={"message": "No claims found"},
                headers=headers,
                status_code=404
            )
            
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": error_msg},
            headers=headers
        )

@app.get("/api/claims/{claim_id}", response_model=dict)
async def get_claim(claim_id: str):
    try:
        response = supabase.table('claims').select("*").eq('id', claim_id).execute()
        if response.data and len(response.data) > 0:
            return format_claim(response.data[0])
        raise HTTPException(status_code=404, detail="Claim not found")
    except Exception as e:
        logger.error(f"Error getting claim {claim_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "timestamp": datetime.utcnow().isoformat(),
        "supabase_connected": supabase is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)