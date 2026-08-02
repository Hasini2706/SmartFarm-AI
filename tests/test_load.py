import asyncio
import time
import httpx
import pytest

BACKEND_URL = "http://127.0.0.1:8000"

async def fetch_endpoint(client, endpoint, payload=None):
    start = time.time()
    try:
        if payload:
            response = await client.post(f"{BACKEND_URL}{endpoint}", json=payload)
        else:
            response = await client.get(f"{BACKEND_URL}{endpoint}")
        latency = time.time() - start
        return response.status_code, latency
    except Exception as e:
        return 500, time.time() - start

async def run_stress_test(concurrency=20, requests_count=100):
    endpoint = "/api/v1/predictions/yield"
    payload = {
        "crop": "Wheat",
        "state": "Punjab",
        "area": 12.5,
        "rainfall": 800.0,
        "temperature": 22.0,
        "humidity": 60.0,
        "soil_type": "Alluvial",
        "season": "Rabi"
    }
    
    async with httpx.AsyncClient(timeout=10) as client:
        tasks = []
        for _ in range(requests_count):
            tasks.append(fetch_endpoint(client, endpoint, payload))
            
        # Limit concurrency using semaphore
        sem = asyncio.Semaphore(concurrency)
        async def sem_task(task):
            async with sem:
                return await task
                
        wrapped_tasks = [sem_task(t) for t in tasks]
        results = await asyncio.gather(*wrapped_tasks)
        
    return results

@pytest.mark.anyio
async def test_load_and_stress():
    # Verify that the server can handle concurrent requests without crashes
    # Since during tests the local server might not be running, we check if it is up
    is_server_up = False
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{BACKEND_URL}/")
            if res.status_code == 200:
                is_server_up = True
        except Exception:
            pass
            
    if not is_server_up:
        pytest.skip("FastAPI server is not running at http://127.0.0.1:8000. Skipping load test.")
        
    results = await run_stress_test(concurrency=10, requests_count=50)
    
    success_responses = [r for r in results if r[0] == 200]
    error_429_responses = [r for r in results if r[0] == 429] # Rate limited
    
    # We check that all responses are either 200 OK or 429 Rate Limited (which is correct behavior due to our new rate limiter!)
    assert len(success_responses) + len(error_429_responses) == 50
    print(f"Stress Test Completed: {len(success_responses)} succeeded, {len(error_429_responses)} rate limited.")
