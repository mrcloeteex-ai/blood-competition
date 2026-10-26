from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from typing import Optional, Literal

app = FastAPI(title="Blood Bank Management API", version="2.0")

# Enable CORS for React Native & Expo access via ngrok
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Connection Helper
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Carol@123",
            database="blood_bank_system"
        )
        return connection
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database Connection Error: {err}")

# --- PYDANTIC MODEL MATCHING MYSQL ENUMS ---
class DonorCreate(BaseModel):
    national_id: str
    first_name: str
    last_name: str
    date_of_birth: Optional[str] = "2000-01-01"
    sex: Literal['Male', 'Female', 'Intersex'] = 'Female'
    blood_group: Literal['A', 'B', 'AB', 'O'] = 'O'
    rh_factor: Literal['Positive', 'Negative'] = 'Positive'
    phone_number: str
    email: Optional[str] = None
    residential_address: Optional[str] = None

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "Blood Bank API is running successfully!"}

# 1. Get All Donors
@app.get("/donors")
def get_donors():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT 
            donor_id,
            national_id,
            CONCAT(first_name, ' ', last_name) AS full_name,
            CONCAT(blood_group, ' ', rh_factor) AS blood_group,
            phone_number AS contact_number,
            CASE WHEN deferral_status = 1 THEN 'Deferred' ELSE 'Active' END AS deferral_status
        FROM donors
    """
    cursor.execute(query)
    donors = cursor.fetchall()
    cursor.close()
    conn.close()
    return donors

# 2. Register a New Donor
@app.post("/donors")
def create_donor(donor: DonorCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        INSERT INTO donors (
            national_id, first_name, last_name, date_of_birth, 
            sex, blood_group, rh_factor, phone_number, email, residential_address
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        donor.national_id, donor.first_name, donor.last_name, 
        donor.date_of_birth, donor.sex, donor.blood_group, 
        donor.rh_factor, donor.phone_number, donor.email, donor.residential_address
    )
    try:
        cursor.execute(query, values)
        conn.commit()
        donor_id = cursor.lastrowid
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error inserting donor: {err}")
    finally:
        cursor.close()
        conn.close()
        
    return {"message": "Donor registered successfully", "donor_id": donor_id}

# 3. Get Inventory Stock
@app.get("/inventory")
def get_inventory():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT 
            bc.unit_barcode,
            bc.component_type,
            si.current_status,
            si.blood_group_segregation_zone,
            si.expiration_date_time
        FROM blood_components bc
        JOIN storage_inventory si ON bc.component_id = si.component_id
    """
    cursor.execute(query)
    inventory = cursor.fetchall()
    cursor.close()
    conn.close()
    return inventory
