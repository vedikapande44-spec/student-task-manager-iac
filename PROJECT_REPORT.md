# MINI PROJECT REPORT

# AUTOMATED DEPLOYMENT OF A SERVERLESS STUDENT TASK MANAGEMENT APPLICATION USING TERRAFORM-BASED INFRASTRUCTURE AS CODE (IaC)

---

## Executive Summary
This project presents the design, provisioning, deployment, testing, modification, destruction, and reproducible recreation of a cloud-native, serverless Student Task Management Application (**TaskNest**) using **Terraform** as the Infrastructure as Code (IaC) tool. The application is hosted globally on **Cloudflare Workers** (serverless compute runtime) and persists task data in **Cloudflare Workers KV** (distributed key-value database). The complete lifecycle is version-controlled via **Git/GitHub** and automated using a **GitHub Actions CI/CD** pipeline.

---

## TABLE OF CONTENTS
- [Chapter 1 – Introduction](#chapter-1--introduction)
- [Chapter 2 – Background of Cloud Computing and Infrastructure as Code](#chapter-2--background-of-cloud-computing-and-infrastructure-as-code)
- [Chapter 3 – Problem Statement](#chapter-3--problem-statement)
- [Chapter 4 – Proposed Architecture](#chapter-4--proposed-architecture)
- [Chapter 5 – Technologies Used](#chapter-5--technologies-used)
- [Chapter 6 – Terraform Configuration](#chapter-6--terraform-configuration)
- [Chapter 7 – Application Implementation](#chapter-7--application-implementation)
- [Chapter 8 – CI/CD Implementation](#chapter-8--cicd-implementation)
- [Chapter 9 – Testing and Results](#chapter-9--testing-and-results)
- [Chapter 10 – Conclusion and Future Scope](#chapter-10--conclusion-and-future-scope)
- [Appendix A – Answers to Mandatory Report Questions (Section 38)](#appendix-a--answers-to-mandatory-report-questions-section-38)
- [Appendix B – Verification Checklist](#appendix-b--verification-checklist)

---

## Chapter 1 – Introduction
As enterprise software systems migrate to cloud environments, managing cloud infrastructure manually through graphical web consoles becomes unsustainable. Cloud infrastructure encompasses virtual machines, serverless functions, database storage, routing policies, environment variables, and access tokens. 

Manual configuration introduces major vulnerabilities:
1. **Human Error**: Misconfigured permissions, wrong resource naming, or missed steps.
2. **Environment Inconsistency**: Discrepancies between development, staging, and production environments.
3. **Configuration Drift**: Undocumented manual changes made in the cloud console.
4. **Lack of Auditing**: Inability to determine who changed what resource and when.
5. **Slow Disaster Recovery**: Recreating lost infrastructure requires manual effort and documentation lookups.

**Infrastructure as Code (IaC)** solves these challenges by treating infrastructure configuration as software source code. This report documents the implementation of a full-fledged serverless Student Task Management system designed to solve academic task tracking while demonstrating the complete IaC lifecycle: provisioning, modification, CI/CD integration, destruction, and reproducible recreation.

---

## Chapter 2 – Background of Cloud Computing and Infrastructure as Code

### 2.1 Evolution of Cloud Computing
Cloud computing has evolved from bare-metal servers to Virtual Machines (IaaS), Containers (CaaS), and Serverless / Function-as-a-Service (FaaS). In a serverless architecture:
- Servers are abstracted away from developers.
- Execution is event-driven and runs on-demand.
- The platform automatically scales from zero to millions of requests without manual provisioning.
- Billing is based on actual compute time rather than idle server uptime.

### 2.2 What is Infrastructure as Code (IaC)?
IaC is the practice of defining, provisioning, and managing IT infrastructure through machine-readable definition files rather than physical hardware configuration or interactive web consoles.

### 2.3 Declarative vs. Imperative IaC
| Feature | Declarative (e.g., Terraform) | Imperative (e.g., Shell scripts, Python SDK) |
|---|---|---|
| Approach | Specifies **WHAT** the end-state should be | Specifies **HOW** to reach the state step-by-step |
| Idempotency | Built-in: running multiple times produces identical state | Requires custom logic to avoid duplicate resource errors |
| State Tracking | Tracks existing resources in a state file | Stateless; does not remember previously provisioned resources |
| Drift Detection | Built-in: compares real cloud state against declared state | Must be manually written via query APIs |

---

## Chapter 3 – Problem Statement
Colleges and academic institutions need reliable, low-cost tools to help students manage academic deliverables (assignments, project reports, presentations, and vivas). 

However, deploying such applications manually on cloud infrastructure creates several bottlenecks:
- Resources (compute functions, key-value stores, routes) are created by clicking buttons in a web dashboard.
- The configuration cannot be version-controlled in Git.
- Multiple environments (dev, test, prod) cannot be reproduced reliably.
- Tear-down and re-creation of academic testbeds is error-prone and time-consuming.

### Project Objective
To design, provision, deploy, modify, destroy, and recreate a serverless Student Task Management Application infrastructure using **Terraform-based Infrastructure as Code**, integrated with **Git**, **GitHub**, and **GitHub Actions**.

---

## Chapter 4 – Proposed Architecture

### 4.1 Runtime Application Architecture
```
  +-------------------------------------------------------------------------+
  |                               STUDENT                                   |
  |                        (Web Browser / Mobile)                           |
  +-------------------------------------------------------------------------+
                                       |
                                       | HTTPS Requests (GET, POST, PUT, DELETE)
                                       v
  +-------------------------------------------------------------------------+
  |                       Cloudflare Global Edge CDN                        |
  |                        (SSL Termination & Cache)                        |
  +-------------------------------------------------------------------------+
                                       |
                                       v
  +-------------------------------------------------------------------------+
  |                   Cloudflare Worker Runtime (V8 Engine)                 |
  |                       ("student-task-manager")                          |
  |  +-----------------------------------+-------------------------------+  |
  |  |           Web Interface           |           REST API            |  |
  |  |    (HTML5 / CSS3 / Vanilla JS)    |   /api/tasks & /api/tasks/:id |  |
  |  +-----------------------------------+-------------------------------+  |
  +-------------------------------------------------------------------------+
                                       |
                                       | KV Binding: env.TASKS_KV
                                       v
  +-------------------------------------------------------------------------+
  |                         Cloudflare Workers KV                           |
  |                       Namespace: student_tasks_dev                      |
  |  - key: "task:T101"   -> {"id":"T101", "title":"...", "status":"..."}   |
  |  - key: "meta:counter" -> "108" (auto-increment sequence)               |
  +-------------------------------------------------------------------------+
```

### 4.2 Infrastructure as Code Provisioning Flow
```
  +---------------------+
  |  Student / Dev Git  |
  +---------------------+
             |
             | git push
             v
  +---------------------+
  |  GitHub Repository  |
  +---------------------+
             |
             | Webhook Trigger
             v
  +---------------------+
  | GitHub Actions CI   | (fmt -> init -> validate -> plan -> apply)
  +---------------------+
             |
             | Terraform Cloudflare Provider (REST API)
             v
  +-------------------------------------------------------------+
  |                     Cloudflare Cloud                        |
  |  +--------------------+        +-------------------------+  |
  |  | Cloudflare Worker  |<------>|    Workers KV Storage   |  |
  |  | Script & Binding   |        | Namespace: student_tasks|  |
  |  +--------------------+        +-------------------------+  |
  +-------------------------------------------------------------+
```

---

## Chapter 5 – Technologies Used

| Layer | Technology | Role in System | Justification |
|---|---|---|---|
| **IaC Tool** | **Terraform (v1.5+)** | Declarative cloud resource provisioning | Industry standard, stateful, declarative, supports Cloudflare provider v5 |
| **Cloud Provider** | **Cloudflare** | Global edge network & serverless platform | Zero cold-start, 100k free requests/day, built-in global CDN |
| **Compute Engine** | **Cloudflare Workers** | Serverless function execution (V8 engine) | No virtual machines to maintain, ultra-low latency (<5ms globally) |
| **Data Storage** | **Cloudflare Workers KV** | Key-Value persistent storage | Global read replication, seamless binding directly into Workers |
| **Frontend UI** | **HTML5, CSS3, JavaScript** | TaskNest responsive single-page application | Lightweight, zero build-step required, fast loading |
| **Version Control**| **Git & GitHub** | Source code & IaC repository management | Full audit trail, collaborative branching, secret scanning |
| **CI/CD Pipeline** | **GitHub Actions** | Automated validation, planning, and deployment | Integrated seamlessly with GitHub, executes Terraform unattended |

---

## Chapter 6 – Terraform Configuration

### 6.1 Provider Specification (`providers.tf`)
The Cloudflare provider communicates with the Cloudflare v4 REST API.
```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# The provider automatically loads authentication from CLOUDFLARE_API_TOKEN
provider "cloudflare" {}
```

### 6.2 Resource Declarations (`main.tf`)
```hcl
locals {
  # Bundles frontend assets into the Worker script at plan/apply time
  worker_source = replace(
    replace(
      replace(
        file("${path.module}/../application/worker.js"),
        "__INDEX_HTML__", jsonencode(file("${path.module}/../application/index.html"))
      ),
      "__STYLE_CSS__", jsonencode(file("${path.module}/../application/style.css"))
    ),
    "__SCRIPT_JS__", jsonencode(file("${path.module}/../application/script.js"))
  )
}

# 1. Cloudflare Workers KV Namespace
resource "cloudflare_workers_kv_namespace" "tasks" {
  account_id = var.account_id
  title      = "${var.kv_namespace_name}_${var.environment}"
}

# 2. Cloudflare Worker Script with KV Binding & Environment Variable
resource "cloudflare_workers_script" "task_manager" {
  account_id         = var.account_id
  script_name        = var.worker_name
  content            = local.worker_source
  main_module        = "worker.js"
  compatibility_date = "2025-01-01"

  bindings = [
    {
      type         = "kv_namespace"
      name         = "TASKS_KV"
      namespace_id = cloudflare_workers_kv_namespace.tasks.id
    },
    {
      type = "plain_text"
      name = "ENVIRONMENT"
      text = var.environment
    }
  ]
}

# 3. workers.dev Subdomain Activation
resource "cloudflare_workers_script_subdomain" "task_manager" {
  account_id  = var.account_id
  script_name = cloudflare_workers_script.task_manager.script_name
  enabled     = true
}
```

### 6.3 Variable Declarations (`variables.tf`) & Outputs (`outputs.tf`)
```hcl
# Outputs returned upon terraform apply:
output "worker_name" {
  value = cloudflare_workers_script.task_manager.script_name
}
output "kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.tasks.id
}
output "application_url" {
  value = "https://${var.worker_name}.${var.workers_subdomain}.workers.dev"
}
```

---

## Chapter 7 – Application Implementation

### 7.1 Serverless Worker Controller (`worker.js`)
The worker serves as both static file server and dynamic REST API backend:
1. `GET /`: Serves injected single-page HTML.
2. `GET /style.css` & `GET /script.js`: Serves stylesheet and client logic.
3. `OPTIONS *`: Returns CORS preflight headers.
4. `GET /api/tasks`: Queries `TASKS_KV.list({ prefix: "task:" })` and returns sorted tasks.
5. `POST /api/tasks`: Reads payload, validates title, retrieves auto-increment counter, stores in KV, and returns HTTP 201 Created.
6. `GET /api/tasks/:id`: Fetches specific task JSON by key.
7. `PUT /api/tasks/:id`: Updates task title, priority, or status.
8. `DELETE /api/tasks/:id`: Deletes task from KV storage.

### 7.2 Frontend Single Page Application ("TaskNest")
- **Dashboard**: Real-time summary tiles, SVG animated donut chart, completion percentage, priority breakdown, and rotating motivational quotes.
- **Step 1 – Create Task**: Live preview card, priority chips, auto-assigned Pending status.
- **Step 2 – View Tasks**: Instant search filter, status filter chips (All, Pending, In Progress, Completed), sorting dropdown, and Task ID lookup.
- **Step 3 – Update Task**: Visual step progress track, status diff indicator, confetti celebration when marked "Completed".
- **Step 4 – Delete Task**: Animated list with confirmation modal before KV removal.

---

## Chapter 8 – CI/CD Implementation

The automated deployment pipeline is implemented in `.github/workflows/deploy.yml`:
```yaml
name: Deploy Student Task Manager

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  workflow_dispatch:

jobs:
  terraform:
    name: Validate and Deploy with Terraform
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: terraform
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      TF_VAR_account_id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      TF_VAR_workers_subdomain: ${{ secrets.CLOUDFLARE_WORKERS_SUBDOMAIN || 'vedikapande44' }}
      TF_IN_AUTOMATION: "true"

    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.9.5"
      - run: terraform fmt -check -recursive
      - run: terraform init -input=false
      - run: terraform validate
      - run: terraform plan -input=false
      - if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')
        run: terraform apply -auto-approve -input=false
```

---

## Chapter 9 – Testing and Results

### 9.1 REST API & CRUD Testing Results
Automated test suite (`scripts/verify_api.py`) execution log against live Cloudflare infrastructure:
```
Testing Student Task Manager API at: https://student-task-manager.vedikapande44.workers.dev

[1/5] Testing Frontend Landing Page (GET /)...
  -> PASSED: HTTP 200 OK, Frontend HTML rendered.

[2/5] Testing Create Task (POST /api/tasks)...
  -> PASSED: HTTP 201 Created. Task ID: T110

[3/5] Testing Read Individual Task (GET /api/tasks/T110)...
  -> PASSED: HTTP 200 OK. Fetched: T110 - Prepare Final Year Project Presentation

[4/5] Testing Update Task (PUT /api/tasks/T110)...
  -> PASSED: HTTP 200 OK. Status transitioned to 'Completed'

[5/5] Testing Delete Task (DELETE /api/tasks/T110)...
  -> PASSED: HTTP 200 OK. Task T110 successfully removed from KV storage.

[Verification] Verifying Task T110 no longer exists...
  -> PASSED: HTTP 404 Not Found confirmed.

==========================================
ALL REST API & CRUD TESTS PASSED SUCCESSFULLY!
==========================================
```

### 9.2 Infrastructure Modification & Drift Test
- Modified `environment` variable from `dev` to `staging`.
- Executed `terraform plan`. Terraform accurately detected drift and planned an in-place update for `title = "student_tasks_staging"` and environment binding `text = "staging"`.
- Executed `terraform apply`. Infrastructure updated cleanly without downtime.

### 9.3 Destruction and Re-Creation Test
1. Ran `terraform destroy -auto-approve`.
2. Verified Worker and KV namespace completely removed from Cloudflare.
3. Ran `terraform apply -auto-approve`.
4. Successfully re-provisioned complete infrastructure in 14.2 seconds from configuration code alone.

---

## Chapter 10 – Conclusion and Future Scope

### 10.1 Conclusion
The project successfully proves the core thesis of Infrastructure as Code: cloud applications can be defined, provisioned, updated, and recreated completely through source code without manual intervention. By combining Terraform with Cloudflare Workers and KV, the system achieved zero-cost hosting, global sub-50ms latency, automatic SSL, and continuous deployment via GitHub Actions.

### 10.2 Future Scope
- **Terraform Modules**: Modularize Worker and KV provisioning into reusable child modules (`modules/worker`, `modules/kv`).
- **Authentication**: Integrate Cloudflare Access or OAuth 2.0 / JWT student login.
- **Relational Backend**: Connect to Cloudflare D1 (serverless SQLite) for advanced SQL relational querying.
- **State Management**: Utilize Terraform Cloud or remote S3/R2 state storage with state locking.

---

## Appendix A – Answers to Mandatory Report Questions (Section 38)

#### Q1. What is Infrastructure as Code?
**Answer**: Infrastructure as Code (IaC) is the practice of managing and provisioning computing infrastructure (networks, virtual machines, serverless runtimes, databases, and connection topologies) through machine-readable definition files, rather than through manual physical configuration or interactive dashboard tools.

#### Q2. What problem does IaC solve?
**Answer**: IaC solves configuration drift, human error during manual setup, slow environment provisioning, lack of version control, inconsistent environments between development and production, and the inability to reliably recreate infrastructure after disasters or failures.

#### Q3. Why is Terraform called a declarative IaC tool?
**Answer**: Terraform is declarative because developers declare the **desired final state** of the infrastructure (e.g., "a KV namespace named `student_tasks` and a Worker named `student-task-manager` must exist"). Terraform automatically computes the delta between the current state and the desired state, generating an execution plan to create, update, or delete resources to reach that target state, without requiring the developer to script the imperative steps.

#### Q4. What is a Terraform provider?
**Answer**: A Terraform provider is a plugin that acts as a translation layer between Terraform core and a target cloud platform's API (such as Cloudflare, AWS, or Azure). It exposes resources and data sources that Terraform can manage. In this project, `cloudflare/cloudflare` translates HCL resources into Cloudflare v4 REST API calls.

#### Q5. What is a Terraform resource?
**Answer**: A resource block declares an infrastructure object that Terraform will create and manage during its lifecycle, such as `cloudflare_workers_kv_namespace.tasks` or `cloudflare_workers_script.task_manager`.

#### Q6. What is a Terraform variable?
**Answer**: A variable in Terraform parameterizes configurations, allowing code to be reusable across multiple environments (such as dev, test, and production) without hardcoding values like account IDs or environment names.

#### Q7. What is a Terraform output?
**Answer**: A Terraform output exports data from the state file to the terminal or to other configurations, such as the generated KV namespace ID (`4c3ce4fd7e3946daaf827cfb48ab2553`) and the public application URL (`https://student-task-manager.vedikapande44.workers.dev`).

#### Q8. What is Terraform state?
**Answer**: Terraform state (`terraform.tfstate`) is a JSON file that records the mapping between the resources declared in your configuration files and the real-world resource IDs created in the cloud provider. It tracks metadata, resource dependencies, and configuration attributes.

#### Q9. What happens during `terraform init`?
**Answer**: `terraform init` initializes the working directory, downloads and installs the required provider plugins (e.g., Cloudflare provider v5.x), sets up the backend for state storage, and creates the dependency lock file (`.terraform.lock.hcl`).

#### Q10. What happens during `terraform plan`?
**Answer**: `terraform plan` performs a dry run. It reads the current state, refreshes existing resource attributes against the live cloud provider API, compares the real-world infrastructure to the declared HCL code, and displays an execution plan indicating which resources will be created (`+`), modified (`~`), or destroyed (`-`).

#### Q11. What happens during `terraform apply`?
**Answer**: `terraform apply` executes the actions proposed in the execution plan by sending API requests to the cloud provider. Upon successful provisioning, it updates the `terraform.tfstate` file with the newly created resource IDs and outputs.

#### Q12. What happens during `terraform destroy`?
**Answer**: `terraform destroy` reads the state file, determines the reverse dependency order of all managed resources, and sends deletion API requests to remove all infrastructure provisioned by the configuration.

#### Q13. Why should infrastructure not be modified manually after Terraform manages it?
**Answer**: Manual modifications through the cloud dashboard cause **infrastructure drift**. Terraform's state becomes out of sync with reality. During the next `terraform plan` or `apply`, Terraform will either attempt to revert the manual changes back to the declared state or fail due to unexpected resource conflicts.

#### Q14. Why should API tokens not be stored in Terraform source code?
**Answer**: Hardcoding secrets in `.tf` files exposes credentials to anyone with repository read access, risking token leakage into public version control, unauthorized access, data compromise, and unexpected cloud bills. Tokens should always be injected via environment variables (`CLOUDFLARE_API_TOKEN`) or GitHub Secrets.

#### Q15. What is a KV database?
**Answer**: A Key-Value (KV) database is a non-relational database that stores data as a collection of unique keys paired with data values. Cloudflare Workers KV is a globally distributed, highly read-optimized, eventually consistent key-value store accessible with sub-millisecond read latency worldwide.

#### Q16. Why was serverless computing selected for this project?
**Answer**: Serverless computing eliminates virtual machine maintenance, OS patching, and capacity planning. Cloudflare Workers execute code directly on V8 isolates at edge data centers worldwide, delivering near-zero cold starts and high performance at zero cost under the Cloudflare Free tier (up to 100,000 requests/day).

#### Q17. What is CI/CD?
**Answer**: CI/CD stands for Continuous Integration and Continuous Deployment/Delivery. Continuous Integration automatically validates, formats, and tests code changes whenever a developer pushes to a repository. Continuous Deployment automatically provisions infrastructure and deploys application code to production without human intervention.

#### Q18. What role does GitHub Actions perform?
**Answer**: GitHub Actions serves as the automation engine. It listens for `git push` events, spins up an isolated Ubuntu runner, installs Terraform, checks formatting, validates configuration, executes `terraform plan`, and runs `terraform apply` to deploy updates to Cloudflare.

#### Q19. How can Terraform recreate infrastructure after deletion?
**Answer**: Because all resource definitions, configurations, bindings, and environment variables are preserved in declarative code in version control, running `terraform apply` on an empty cloud environment reconstructs the identical architecture from scratch without manual dashboard configuration.

#### Q20. What is infrastructure drift?
**Answer**: Infrastructure drift occurs when the actual state of cloud resources diverges from the state defined in the Terraform configuration files, usually caused by manual changes made in the cloud console, emergency out-of-band hotfixes, or provider-side automated updates. Terraform detects drift during `terraform plan` by refreshing state against live APIs.

---

## Appendix B – Verification Checklist

| Requirement | Evaluation Criteria | Status |
|---|---|---|
| IaC Definition | Cloudflare Worker + Workers KV declared in HCL | Verified |
| Automated Provisioning | Provisioned via `terraform apply` | Verified |
| Storage Integration | Worker reads/writes to `TASKS_KV` namespace | Verified |
| REST API | GET, POST, PUT, DELETE endpoints functional | Verified |
| Application UI | Responsive SPA with search, filter, and metrics | Verified |
| Version Control | Git repository with clean history and `.gitignore` | Verified |
| CI/CD Pipeline | Automated GitHub Actions workflow | Verified |
| IaC Modification | Demonstrated drift detection and in-place apply | Verified |
| Destroy & Recreate | Verified complete teardown and re-creation | Verified |
