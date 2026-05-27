
```md
# API DOCUMENTATION

# Base URL

/api/v1

---

# Generate Quotation

POST /quotation/generate

## Request

{
  "customer_name": "Ramesh",
  "phone": "9876543210",
  "feet": 500,
  "phase": "single",
  "starter_type": "auto",
  "preferred_brand": "crompton"
}

---

## Response

{
  "pipe_length": 152.44,
  "cable_length": 162.44,
  "pipe_cost": 10670,
  "cable_cost": 20305,
  "motor_recommendations": [],
  "grand_total": 145897
}

---

# Get Quotation History

GET /quotation/history

---

# Download PDF

GET /quotation/pdf/{id}

---

# Save Quotation

POST /quotation/save

---

# Health Check

GET /health
```

---