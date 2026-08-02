import os
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from fpdf import FPDF

from app import models, schemas, auth
from app.database import get_db
from app.ml.disease_classifier import DiseaseClassifier
from app.ml.pest_detector import PestDetector
from app.ml.crop_recommender import CropRecommender
from app.ml.fertilizer_recommender import FertilizerRecommender

router = APIRouter(
    prefix="/crop",
    tags=["Crop Management & Vision"]
)

# Instantiate models
disease_classifier = DiseaseClassifier()
pest_detector = PestDetector()
crop_recommender = CropRecommender()
fertilizer_recommender = FertilizerRecommender()

# Static directories for uploads and reports
UPLOAD_DIR = "static/uploads"
REPORT_DIR = "static/reports"

def validate_image_signature(content: bytes) -> bool:
    """Verifies file signature matches actual PNG/JPEG bytes to prevent executable spoofing."""
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return True
    if content.startswith(b"\xff\xd8\xff"):
        return True
    return False

def run_virus_scan(filename: str, content: bytes) -> bool:
    """
    Mock virus scanning hook. In production, this can connect to ClamAV socket or Virustotal API.
    Returns True if file is clean, False if threat is found.
    """
    # Simple signature threat check (mocking EICAR test file pattern)
    if b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*" in content:
        return False
    return True
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)


class PDFReport(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(16, 124, 65) # Premium green
        self.cell(0, 10, "SmartFarm AI - Diagnostic Report", border=0, align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 10)
        self.set_text_color(128, 128, 128)
        self.cell(0, 6, "Precision Agriculture Decision Platform", border=0, align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(8)
        self.set_draw_color(16, 124, 65)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}} | SmartFarm AI Inc. © 2026", align="C")


def generate_pdf_report(diagnosis_data: dict, filepath: str):
    pdf = PDFReport()
    pdf.add_page()
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(51, 51, 51)
    
    # Metadata
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, f"Diagnosis Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)
    
    # Diagnosis summary card
    pdf.set_fill_color(240, 248, 240)
    pdf.rect(10, pdf.get_y(), 190, 26, "F")
    
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(40, 6, " Target Crop:", new_x="RIGHT")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 6, diagnosis_data["crop_name"], new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(40, 6, " Diagnosed Condition:", new_x="RIGHT")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 6, diagnosis_data["disease_name"], new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(40, 6, " Confidence Score:", new_x="RIGHT")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 6, f"{round(diagnosis_data['confidence'] * 100, 1)}%", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)
    
    # Sections: Causes, Prevention, Treatment, Fertilizer
    sections = [
        ("Identified Causes", diagnosis_data["causes"]),
        ("Prevention Strategies", diagnosis_data["prevention"]),
        ("Recommended Treatment Plans", diagnosis_data["treatment"])
    ]
    
    for title, items in sections:
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(16, 124, 65)
        pdf.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(51, 51, 51)
        pdf.set_font("Helvetica", "", 10)
        
        for item in items:
            pdf.multi_cell(0, 5, f"- {item}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)
        
    # Fertilizer
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(16, 124, 65)
    pdf.cell(0, 8, "Nutrient & Fertilizer Recommendation", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(51, 51, 51)
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, diagnosis_data["fertilizer_recommendation"], new_x="LMARGIN", new_y="NEXT")
    
    # Save file
    pdf.output(filepath)


@router.post("/disease", response_model=schemas.DiseaseDiagnosisOut)
async def detect_crop_disease(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional)
):
    """
    Upload crop leaf image to detect diseases, get prevention details, and generate a downloadable report.
    """
    # Verify file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a JPG, JPEG or PNG image."
        )
        
    # Read and validate file size (max 5MB)
    content = await file.read(5 * 1024 * 1024 + 1)
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds the maximum limit of 5MB."
        )
        
    # Verify actual image magic number signature (MIME signature verification)
    if not validate_image_signature(content):
        raise HTTPException(
            status_code=400,
            detail="Invalid image signature. The file headers do not match a valid JPEG or PNG image."
        )

    # Perform mock virus scan
    if not run_virus_scan(file.filename, content):
        raise HTTPException(
            status_code=400,
            detail="File upload blocked: A security threat or malicious signature was detected in the file."
        )
        
    # Save uploaded file
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(content)
        
    # Create Upload entry
    user_id = current_user.id if current_user else None
    db_upload = models.Upload(
        user_id=user_id,
        filename=file.filename,
        file_path=file_path,
        upload_type="disease",
        status="completed"
    )
    db.add(db_upload)
    db.commit()
    db.refresh(db_upload)
    
    # Perform Inference
    try:
        diagnosis_res = disease_classifier.predict_disease(file_path)
        
        # Save diagnosis history
        db_history = models.DiseaseHistory(
            user_id=user_id,
            crop_name=diagnosis_res["crop_name"],
            disease_name=diagnosis_res["disease_name"],
            confidence=diagnosis_res["confidence"],
            causes="\n".join(diagnosis_res["causes"]),
            prevention="\n".join(diagnosis_res["prevention"]),
            treatment="\n".join(diagnosis_res["treatment"]),
            fertilizer_recommendation=diagnosis_res["fertilizer_recommendation"],
            image_path=file_path
        )
        db.add(db_history)
        db.commit()
        db.refresh(db_history)
        
        # Generate Report PDF
        report_filename = f"report_{db_history.id}_{file_id}.pdf"
        report_path = os.path.join(REPORT_DIR, report_filename)
        generate_pdf_report(diagnosis_res, report_path)
        
        # Save Report DB entry
        db_report = models.Report(
            user_id=user_id,
            title=f"Crop Health Audit: {diagnosis_res['disease_name']}",
            report_type="disease",
            data=diagnosis_res,
            file_path=report_path
        )
        db.add(db_report)
        db.commit()
        
        # Attach report_id to result
        diagnosis_res["report_id"] = db_history.id
        
        return diagnosis_res
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference or report generation failed: {str(e)}"
        )

@router.get("/report/{history_id}/download")
def download_diagnosis_report(
    history_id: int,
    db: Session = Depends(get_db)
):
    """
    Downloads the PDF diagnostic report for a specific disease diagnosis event.
    """
    # Fetch report
    history = db.query(models.DiseaseHistory).filter(models.DiseaseHistory.id == history_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="Diagnosis record not found")
        
    # Search in reports DB
    report = db.query(models.Report).filter(
        models.Report.report_type == "disease",
        models.Report.data["disease_name"].astext == history.disease_name
    ).order_by(models.Report.created_at.desc()).first()
    
    if not report or not report.file_path or not os.path.exists(report.file_path):
        # Regenerate report if deleted or missing
        report_filename = f"report_{history.id}_{uuid.uuid4()}.pdf"
        report_path = os.path.join(REPORT_DIR, report_filename)
        diagnosis_data = {
            "crop_name": history.crop_name,
            "disease_name": history.disease_name,
            "confidence": history.confidence,
            "causes": history.causes.split("\n") if history.causes else [],
            "prevention": history.prevention.split("\n") if history.prevention else [],
            "treatment": history.treatment.split("\n") if history.treatment else [],
            "fertilizer_recommendation": history.fertilizer_recommendation
        }
        generate_pdf_report(diagnosis_data, report_path)
        
        # Update or create report
        if report:
            report.file_path = report_path
        else:
            report = models.Report(
                user_id=history.user_id,
                title=f"Crop Health Audit: {history.disease_name}",
                report_type="disease",
                data=diagnosis_data,
                file_path=report_path
            )
            db.add(report)
        db.commit()
        
    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename=f"SmartFarm_Report_{history.crop_name}_{history.id}.pdf"
    )

@router.post("/pest", response_model=schemas.PestDiagnosisOut)
async def detect_pests(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional)
):
    """
    Upload pest image to detect specific pests, understand severity levels, and retrieve treatments.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a JPG, JPEG or PNG image."
        )
        
    # Read and validate file size (max 5MB)
    content = await file.read(5 * 1024 * 1024 + 1)
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds the maximum limit of 5MB."
        )
        
    # Verify actual image magic number signature (MIME signature verification)
    if not validate_image_signature(content):
        raise HTTPException(
            status_code=400,
            detail="Invalid image signature. The file headers do not match a valid JPEG or PNG image."
        )

    # Perform mock virus scan
    if not run_virus_scan(file.filename, content):
        raise HTTPException(
            status_code=400,
            detail="File upload blocked: A security threat or malicious signature was detected in the file."
        )
        
    file_id = str(uuid.uuid4())
    filename = f"pest_{file_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(content)
        
    # Save upload metadata
    user_id = current_user.id if current_user else None
    db_upload = models.Upload(
        user_id=user_id,
        filename=file.filename,
        file_path=file_path,
        upload_type="pest",
        status="completed"
    )
    db.add(db_upload)
    db.commit()
    
    try:
        pest_res = pest_detector.detect_pest(file_path)
        return pest_res
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Pest detection inference error: {str(e)}"
        )

@router.post("/recommendation", response_model=schemas.CropRecOutput)
def recommend_crops(payload: schemas.CropRecInput):
    """
    Provides top 5 crop suggestions with probability distribution based on soil analysis.
    """
    try:
        recs = crop_recommender.predict(
            N=payload.N,
            P=payload.P,
            K=payload.K,
            temperature=payload.temperature,
            humidity=payload.humidity,
            rainfall=payload.rainfall,
            pH=payload.pH
        )
        return {"recommendations": recs}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Crop recommendation algorithm error: {str(e)}"
        )

@router.post("/fertilizer", response_model=schemas.FertilizerOutput)
def recommend_fertilizer(payload: schemas.FertilizerInput):
    """
    Recommends optimal fertilizer based on NPK levels, soil, and target crop.
    """
    try:
        rec = fertilizer_recommender.predict(
            soil_type=payload.soil_type,
            crop=payload.crop,
            N=payload.N,
            P=payload.P,
            K=payload.K
        )
        return rec
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fertilizer recommendation error: {str(e)}"
        )
