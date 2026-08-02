import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional

# ==========================================
# AUTH SCHEMAS
# ==========================================
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
import re

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = "farmer"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class UserOut(UserBase):
    id: int
    password_hash: Optional[str] = None
    google_id: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    username: str
    password: str

class GoogleLoginRequest(BaseModel):
    token: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    username: Optional[str] = None


# ==========================================
# ML INPUT & OUTPUT SCHEMAS
# ==========================================
class YieldInput(BaseModel):
    crop: str = Field(..., description="Crop name: Rice, Wheat, Corn, Cotton, Potato")
    state: str = Field(..., description="State name")
    area: float = Field(..., description="Area in hectares")
    rainfall: float = Field(..., description="Average annual rainfall in mm")
    temperature: float = Field(..., description="Average temperature in Celsius")
    humidity: float = Field(..., description="Average relative humidity in %")
    soil_type: str = Field(..., description="Soil Type: Alluvial, Black, Red, Laterite, Sandy")
    season: str = Field(..., description="Season: Kharif, Rabi, Summer")

class YieldOutput(BaseModel):
    predicted_yield: float = Field(..., description="Predicted yield in tonnes per hectare (t/ha)")
    predicted_production: float = Field(..., description="Total predicted production (Yield * Area)")
    confidence: float = Field(..., description="Confidence score")
    graph_data: List[Dict[str, Any]] = Field(..., description="Plot data comparing yield under rainfall variations")

class CropRecInput(BaseModel):
    N: float = Field(..., description="Nitrogen content in soil (mg/kg)")
    P: float = Field(..., description="Phosphorus content in soil (mg/kg)")
    K: float = Field(..., description="Potassium content in soil (mg/kg)")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Relative humidity in %")
    rainfall: float = Field(..., description="Rainfall in mm")
    pH: float = Field(..., description="Soil pH value (0-14)")

class CropRecommendationDetail(BaseModel):
    crop: str
    probability: float

class CropRecOutput(BaseModel):
    recommendations: List[CropRecommendationDetail]

class FertilizerInput(BaseModel):
    soil_type: str = Field(..., description="Soil Type: Alluvial, Black, Red, Laterite, Sandy")
    crop: str = Field(..., description="Target Crop")
    N: float = Field(..., description="Nitrogen content")
    P: float = Field(..., description="Phosphorus content")
    K: float = Field(..., description="Potassium content")

class FertilizerOutput(BaseModel):
    recommended_fertilizer: str
    reasons: List[str]
    application_tips: List[str]

class IrrigationInput(BaseModel):
    weather: str = Field(..., description="Sunny, Cloudy, Rainy")
    soil_moisture: float = Field(..., description="Soil Moisture level (%)")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Relative humidity (%)")
    crop_stage: str = Field(..., description="Initial, Mid, Late")

class IrrigationOutput(BaseModel):
    water_needed: float = Field(..., description="Water needed in Liters per m²")
    schedule: str = Field(..., description="Recommended irrigation interval")
    warnings: List[str] = Field(..., description="Safety / stress warnings")


# ==========================================
# VISION & DIAGNOSIS SCHEMAS
# ==========================================
class DiseaseDiagnosisOut(BaseModel):
    crop_name: str
    disease_name: str
    confidence: float
    causes: List[str]
    prevention: List[str]
    treatment: List[str]
    fertilizer_recommendation: str
    report_id: Optional[int] = None

class PestDiagnosisOut(BaseModel):
    pest_name: str
    confidence: float
    urgency_level: str # Low, Medium, High
    organic_treatment: List[str]
    chemical_treatment: List[str]
    description: str


# ==========================================
# WEATHER SCHEMAS
# ==========================================
class WeatherData(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    pressure: float
    rain_probability: float
    condition: str
    forecast: List[Dict[str, Any]]

class WeatherAdviceResponse(BaseModel):
    weather: WeatherData
    farming_advice: List[str]


# ==========================================
# CHAT SCHEMAS
# ==========================================
class ChatMessageCreate(BaseModel):
    message: Optional[str] = None
    prompt: Optional[str] = None
    query: Optional[str] = None

    def get_text(self) -> str:
        text = self.message or self.prompt or self.query
        if not text or not text.strip():
            raise ValueError("Query or prompt text is required.")
        return text.strip()


class ChatMessageOut(BaseModel):
    id: int
    sender: str
    message: str
    provider: Optional[str] = "gemini"
    audio_path: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class VoiceChatResponse(BaseModel):
    chat_message: ChatMessageOut
    audio_base64: Optional[str] = None


# ==========================================
# DASHBOARD SCHEMAS
# ==========================================
class KPICards(BaseModel):
    total_diagnoses: int
    total_predictions: int
    water_saved_liters: float
    average_yield: float

class RecentActivity(BaseModel):
    id: int
    activity_type: str # diagnosis, yield, recommendation, irrigation
    description: str
    timestamp: datetime.datetime

class DashboardData(BaseModel):
    kpis: KPICards
    yield_trends: List[Dict[str, Any]]
    disease_history: List[Dict[str, Any]]
    recent_activities: List[RecentActivity]


# ==========================================
# REFRESH TOKEN & AUDIT LOG SCHEMAS
# ==========================================
class RefreshTokenRequest(BaseModel):
    refresh_token: str

class AuditLogOut(BaseModel):
    id: int
    action: str
    ip_address: Optional[str]
    details: Optional[str]
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    farm_size: Optional[float] = None
    farm_name: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    soil_n: Optional[float] = None
    soil_p: Optional[float] = None
    soil_k: Optional[float] = None
