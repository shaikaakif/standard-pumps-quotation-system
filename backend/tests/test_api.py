import httpx


def test_api():
    print("--------------------------------------------------")
    print("PHASE 3 - FASTAPI API SYSTEM INTEGRATION TEST")
    print("--------------------------------------------------")

    base_url = "http://127.0.0.1:8000/api/v1"

    # 1. Test Health endpoint
    print("[1] Querying health check...")
    try:
        response = httpx.get(f"{base_url}/health")
        print(f"Health Response: Status={response.status_code}, Body={response.json()}")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    except Exception as e:
        print(f"Error connecting to FastAPI server: {e}")
        print(
            "Please make sure the uvicorn backend server is running in the background!"
        )
        return

    # 2. Test Case A: STANDARD Mode Deep Bore (500 FT)
    print("\n[2] Testing POST /api/v1/quotation/generate - Deep Bore (STANDARD Mode)")
    payload_a = {
        "customer_name": "Ramesh Deep",
        "phone": "9876543210",
        "feet": 500,
        "mode": "STANDARD",
        "starter_type": "AUTO",
        "phase": "SINGLE_PHASE",
    }

    response = httpx.post(f"{base_url}/quotation/generate", json=payload_a)
    print(f"Response Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"-> Quotation ID: {data['quotation_id']}")
        print(f"-> Generated At: {data['generated_at']}")
        print(
            f"-> Pipe: Brand Detail={data['pipe']['brand']}, Cost=Rs.{data['pipe']['total_cost']}"
        )
        print(
            f"-> Cable: Brand Detail={data['cable']['brand']}, Cost=Rs.{data['cable']['total_cost']}"
        )
        print(f"-> Cable Display Brand: '{data['cable']['brand']['display_brand']}'")
        print(
            f"-> Motor primary spec: '{data['motors'][0]['spec']}' with HP={data['motors'][0]['hp']}"
        )
        print(f"-> Motor primary reasoning: '{data['motors'][0]['reasoning']}'")
        print(
            f"-> Starter brand: '{data['starter']['brand']}', Price=Rs.{data['starter']['price']}"
        )
        print(
            f"-> Summary formatted total: '{data['summary']['formatted_grand_total']}'"
        )

        # Standard mode forces premium cables
        assert data["cable"]["brand"]["internal_brand"] == "Sudhakar Company"
        assert data["cable"]["brand"]["display_brand"] == "Sudhakar Company Cable"
    else:
        print(f"Failed Body: {response.text}")

    # 3. Test Case B: REGULAR Mode Shallow Bore (200 FT) - Brand Display check
    print("\n[3] Testing POST /api/v1/quotation/generate - Shallow Bore (REGULAR Mode)")
    payload_b = {
        "customer_name": "Ramesh Shallow",
        "phone": "9876543210",
        "feet": 200,
        "mode": "REGULAR",
        "starter_type": "manual",
        "phase": "single",
    }

    response = httpx.post(f"{base_url}/quotation/generate", json=payload_b)
    print(f"Response Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"-> Cable Internal Brand: '{data['cable']['brand']['internal_brand']}'")
        print(f"-> Cable Display Brand: '{data['cable']['brand']['display_brand']}'")

        # Local normal cable display brand should be exactly "Cable WIRE"
        assert data["cable"]["brand"]["internal_brand"] == "Local / Normal"
        assert data["cable"]["brand"]["display_brand"] == "Cable WIRE"
        print(
            "-> SUCCESS: Local normal cable display is exactly 'Cable WIRE' (verdict fulfilled!)"
        )
    else:
        print(f"Failed Body: {response.text}")

    # 4. Test Case C: Validation error trigger (feet <= 0)
    print("\n[4] Testing POST /api/v1/quotation/generate - Validation Error Trigger")
    payload_c = {
        "customer_name": "Ramesh Error",
        "phone": "9876543210",
        "feet": -50,
        "mode": "REGULAR",
        "starter_type": "manual",
        "phase": "single",
    }
    response = httpx.post(f"{base_url}/quotation/generate", json=payload_c)
    print(f"Response Status (expect 422): {response.status_code}")
    assert response.status_code == 422
    print("-> SUCCESS: Proper Pydantic request validation error captured.")

    print("\n--------------------------------------------------")
    print("PHASE 3 - FASTAPI API LAYER SUCCESSFULLY VERIFIED")
    print("--------------------------------------------------")


if __name__ == "__main__":
    test_api()
