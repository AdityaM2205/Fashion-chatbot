from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any, Tuple
import logging
from sentence_transformers import SentenceTransformer, util
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Fashion Chatbot API")

# Initialize the sentence transformer model
MODEL_NAME = "all-MiniLM-L6-v2"  # Lightweight but effective model
model = SentenceTransformer(MODEL_NAME)

# Enhanced fashion knowledge base with more examples
ENHANCED_FASHION_KNOWLEDGE = {
    "trends": [
        "Oversized blazers are in style this season.",
        "Pastel colors are trending for spring.",
        "Sustainable fashion is becoming increasingly popular.",
        "Vintage and retro styles are making a comeback.",
        "Minimalist and capsule wardrobes are trending for their sustainability.",
    ],
    "styles": {
        "casual": "Casual style is all about comfort and simplicity. Think jeans, t-shirts, and sneakers. It's perfect for everyday wear.",
        "formal": "Formal wear typically includes suits, dress shirts, formal shoes, and accessories like ties and cufflinks. For women, this could mean elegant dresses or pantsuits.",
        "business": "Business attire is professional and polished. For men, this means dress shirts, slacks, and blazers. For women, it could be blouses, pencil skirts, or tailored pants.",
        "bohemian": "Bohemian style features flowy fabrics, earthy tones, and eclectic patterns. Think maxi dresses, fringed vests, and layered jewelry.",
        "athleisure": "Athleisure combines athletic wear with casual clothing. It includes items like yoga pants, hoodies, and sneakers that are both comfortable and stylish.",
    },
    "colors": [
        "Neutral colors like beige, white, and gray are versatile and timeless.",
        "Bold colors can make a statement and add personality to your outfit.",
        "Earthy tones like olive green, terracotta, and mustard are great for a natural look.",
        "Jewel tones such as emerald, sapphire, and amethyst add richness to any outfit.",
    ],
    "accessories": [
        "Statement jewelry can elevate any outfit.",
        "A good quality watch is a timeless accessory.",
        "Scarves can add color and texture to your look.",
        "A classic leather belt can tie an outfit together.",
        "Sunglasses are both stylish and practical for sunny days.",
    ],
    "outfits": [
        "For a casual day out, try pairing light wash jeans with a white t-shirt and sneakers.",
        "A little black dress is perfect for any formal occasion and can be dressed up or down with accessories.",
        "For a business casual look, pair tailored trousers with a blouse and a blazer.",
        "Layering is key for transitional weather - try a denim jacket over a summer dress.",
    ]
}

# Precompute embeddings for all knowledge base items
knowledge_embeddings = {}
for category, items in ENHANCED_FASHION_KNOWLEDGE.items():
    if isinstance(items, list):
        texts = items
    else:  # dict
        texts = list(items.values())
    knowledge_embeddings[category] = {
        'texts': texts,
        'embeddings': model.encode(texts, convert_to_tensor=True)
    }

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request/response models
class Message(BaseModel):
    role: str
    content: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    chat_history: List[Dict[str, str]] = []

class ChatResponse(BaseModel):
    response: str
    metadata: Optional[Dict[str, Any]] = {}

# Using ENHANCED_FASHION_KNOWLEDGE instead of FASHION_KNOWLEDGE

def find_most_relevant_response(message: str, category: str = None) -> Tuple[str, float]:
    """Find the most relevant response from the knowledge base using semantic search."""
    # Encode the input message
    message_embedding = model.encode(message, convert_to_tensor=True)
    
    best_score = -1
    best_response = None
    
    # If category is specified, only search in that category
    categories_to_search = [category] if category else knowledge_embeddings.keys()
    
    for cat in categories_to_search:
        if cat not in knowledge_embeddings:
            continue
            
        # Calculate cosine similarity
        similarities = util.cos_sim(
            message_embedding.unsqueeze(0),
            knowledge_embeddings[cat]['embeddings']
        )[0]
        
        # Get the index of the highest similarity score
        max_idx = similarities.argmax().item()
        max_score = similarities[max_idx].item()
        
        if max_score > best_score:
            best_score = max_score
            best_response = knowledge_embeddings[cat]['texts'][max_idx]
    
    return best_response, best_score

def generate_response(message: str, chat_history: List[Dict[str, str]] = None) -> str:
    """Generate a response using semantic similarity with the knowledge base."""
    if not message.strip():
        return "I didn't receive any message. Could you please ask me something about fashion?"
    
    # Check for greetings
    message_lower = message.lower()
    if any(word in message_lower for word in ["hello", "hi", "hey"]):
        return "Hello! I'm your fashion assistant. How can I help you with fashion today?"
    
    # Check for specific categories
    category = None
    if any(word in message_lower for word in ["trend", "trending"]):
        category = "trends"
    elif any(word in message_lower for word in ["color", "colors", "colour"]):
        category = "colors"
    elif any(word in message_lower for word in ["accessory", "accessories"]):
        category = "accessories"
    elif any(word in message_lower for word in ["outfit", "wear", "dress"]):
        category = "outfits"
    
    # Find the most relevant response
    best_response, score = find_most_relevant_response(message, category)
    
    # If we found a good match, return it
    if best_response and score > 0.3:  # Threshold can be adjusted
        if category == "trends" and score < 0.5:
            # For trends, be more strict with the threshold
            return f"Here are some current fashion trends: {' '.join(ENHANCED_FASHION_KNOWLEDGE['trends'])}"
        return best_response
    
    # Check for style-related questions
    if not category:
        for style in ENHANCED_FASHION_KNOWLEDGE["styles"]:
            if style in message_lower:
                return ENHANCED_FASHION_KNOWLEDGE["styles"][style]
    
    # Fallback responses
    fallbacks = [
        "I'm a fashion assistant. I can help you with fashion trends, styles, colors, and accessories.",
        "I'm not sure I understand. Could you rephrase your question about fashion?",
        "I'm here to help with fashion advice. Could you tell me more about what you're looking for?",
        "I specialize in fashion advice. You can ask me about trends, styles, colors, or outfit ideas."
    ]
    
    # Use the message embedding to select a fallback
    message_embedding = model.encode(message, convert_to_tensor=True)
    fallback_embeddings = model.encode(fallbacks, convert_to_tensor=True)
    similarities = util.cos_sim(message_embedding.unsqueeze(0), fallback_embeddings)[0]
    best_fallback_idx = similarities.argmax().item()
    
    return fallbacks[best_fallback_idx]

def fallback_response(message: str) -> str:
    """Fallback to keyword-based response if model fails."""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ["trend", "trending"]):
        return "Here are some current fashion trends: " + " | ".join(ENHANCED_FASHION_KNOWLEDGE["trends"])
    
    for style in ENHANCED_FASHION_KNOWLEDGE["styles"]:
        if style in message_lower:
            return ENHANCED_FASHION_KNOWLEDGE["styles"][style]
    
    if any(word in message_lower for word in ["color", "colors", "colour"]):
        return " ".join(ENHANCED_FASHION_KNOWLEDGE["colors"])
    
    if any(word in message_lower for word in ["accessory", "accessories"]):
        return " ".join(ENHANCED_FASHION_KNOWLEDGE["accessories"])
    
    if any(word in message_lower for word in ["outfit", "wear", "dress"]):
        return "Here are some outfit ideas: " + " | ".join(ENHANCED_FASHION_KNOWLEDGE["outfits"])
    
    return "I'm a fashion assistant. I can help you with fashion trends, styles, colors, and accessories."

# API endpoints
@app.get("/")
async def root():
    return {"message": "Fashion Chatbot API is running"}

@app.post("/chat", response_model=ChatResponse)
async def chat(chat_request: ChatRequest):
    try:
        user_message = chat_request.message.strip()
        chat_history = chat_request.chat_history or []
        
        logger.info(f"Received message: {user_message}")
        logger.debug(f"Chat history length: {len(chat_history)}")
        
        # Generate response using the model
        bot_response = generate_response(user_message, chat_history)
        
        # Log the response for debugging
        logger.info(f"Generated response: {bot_response[:100]}..." if len(bot_response) > 100 else f"Generated response: {bot_response}")
        return ChatResponse(
            response=bot_response,
            metadata={"model": "keyword-matcher"}
        )
    except Exception as e:
        logger.error(f"Error processing chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing your request")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
