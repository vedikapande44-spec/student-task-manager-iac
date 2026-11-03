"""
Verification and Test Script for Student Task Manager REST API
Tests all CRUD operations (POST, GET, PUT, DELETE) against the deployed Cloudflare Worker.
"""

import json
import sys
import time
import urllib.error
import urllib.request

DEFAULT_URL = "https://student-task-manager.vedikapande44.workers.dev"

def test_api(base_url=DEFAULT_URL):
    print("==========================================")
    print(" Student Task Manager REST API Test Suite")
    print(f" Target: {base_url}")
    print("==========================================\n")

    headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) StudentTaskManagerTest/1.0"
    }

    # 1. Health check / GET /
    print("[1/5] Testing Frontend Landing Page (GET /)...")
    req = urllib.request.Request(f"{base_url}/", headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        body = resp.read().decode("utf-8")
        assert "TaskNest" in body or "Student Task Manager" in body
        print("  -> PASSED: HTTP 200 OK, Frontend HTML rendered.")

    # 2. POST /api/tasks (Create Task)
    print("\n[2/5] Testing Create Task (POST /api/tasks)...")
    payload = {
        "title": "Prepare Final Year Project Presentation",
        "priority": "High",
        "status": "Pending",
        "category": "Academic"
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/api/tasks", data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        assert resp.status == 201, f"Expected 201, got {resp.status}"
        created = json.loads(resp.read().decode("utf-8"))
        task_id = created["id"]
        assert created["title"] == payload["title"]
        assert created["priority"] == "High"
        assert created["status"] == "Pending"
        print(f"  -> PASSED: HTTP 201 Created. Task ID: {task_id}")

    # 3. GET /api/tasks/{id} (Read Task)
    print(f"\n[3/5] Testing Read Individual Task (GET /api/tasks/{task_id})...")
    req = urllib.request.Request(f"{base_url}/api/tasks/{task_id}?_t={int(time.time()*1000)}", headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        fetched = json.loads(resp.read().decode("utf-8"))
        assert fetched["id"] == task_id
        assert fetched["title"] == payload["title"]
        print(f"  -> PASSED: HTTP 200 OK. Fetched: {fetched['id']} - {fetched['title']}")

    # 4. PUT /api/tasks/{id} (Update Task status from Pending to Completed)
    print(f"\n[4/5] Testing Update Task (PUT /api/tasks/{task_id})...")
    update_payload = {
        "status": "Completed"
    }
    data = json.dumps(update_payload).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/api/tasks/{task_id}", data=data, headers=headers, method="PUT")
    with urllib.request.urlopen(req, timeout=10) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        updated = json.loads(resp.read().decode("utf-8"))
        assert updated["id"] == task_id
        assert updated["status"] == "Completed"
        print(f"  -> PASSED: HTTP 200 OK. Status transitioned to '{updated['status']}'")

    # 5. DELETE /api/tasks/{id} (Delete Task)
    print(f"\n[5/5] Testing Delete Task (DELETE /api/tasks/{task_id})...")
    req = urllib.request.Request(f"{base_url}/api/tasks/{task_id}", headers=headers, method="DELETE")
    with urllib.request.urlopen(req, timeout=10) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        deleted = json.loads(resp.read().decode("utf-8"))
        assert deleted["id"] == task_id
        print(f"  -> PASSED: HTTP 200 OK. Task {task_id} successfully removed from KV storage.")

    # 6. Verify Deletion
    print(f"\n[Verification] Verifying Task {task_id} is removed...")
    time.sleep(1.0)
    # Check individual resource
    req = urllib.request.Request(f"{base_url}/api/tasks/{task_id}?_t={int(time.time()*1000)}", headers=headers)
    try:
        urllib.request.urlopen(req, timeout=10)
        print("  -> FAILED: Expected 404 for deleted task!")
        sys.exit(1)
    except urllib.error.HTTPError as err:
        assert err.code == 404, f"Expected 404, got {err.code}"
        print("  -> PASSED: HTTP 404 Not Found confirmed for individual endpoint.")

    # Check collection listing
    req_list = urllib.request.Request(f"{base_url}/api/tasks?_t={int(time.time()*1000)}", headers=headers)
    with urllib.request.urlopen(req_list, timeout=10) as resp:
        all_tasks = json.loads(resp.read().decode("utf-8"))
        all_ids = [t["id"] for t in all_tasks if t]
        assert task_id not in all_ids, f"Task {task_id} still listed in collection!"
        print(f"  -> PASSED: Task {task_id} verified absent from collection listing.")

    print("\n==========================================")
    print(" ALL REST API & CRUD TESTS PASSED 100%!  ")
    print("==========================================")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    test_api(url)
