# Project Screenshots & Evidence Guide

This folder contains the verification screenshots required for project evaluation under **Section 32 (Mandatory Project Deliverables)** of the course specification.

---

## Required Screenshots Checklist

| # | Screenshot Filename | Description | Status / How to Capture |
|---|---------------------|-------------|-------------------------|
| 1 | `01_terraform_version.png` | Terraform CLI installed version | Run `terraform --version` in terminal. |
| 2 | `02_terraform_init.png` | Successful initialization of Terraform and provider | Run `cd terraform && terraform init`. Shows `"Terraform has been successfully initialized!"`. |
| 3 | `03_terraform_validate.png` | Configuration syntax and schema validation | Run `cd terraform && terraform validate`. Shows `"Success! The configuration is valid."`. |
| 4 | `04_terraform_plan.png` | Execution plan displaying resources to be created | Run `cd terraform && terraform plan`. Shows planned Worker, KV namespace, bindings. |
| 5 | `05_terraform_apply.png` | Infrastructure provisioning completion | Run `cd terraform && terraform apply`. Shows `"Apply complete!"` and outputs. |
| 6 | `06_cloudflare_worker.png` | Worker deployed in Cloudflare Dashboard | Open Cloudflare Dashboard > Compute (Workers & Pages) > `student-task-manager`. |
| 7 | `07_cloudflare_kv.png` | Workers KV Namespace in Cloudflare Dashboard | Open Cloudflare Dashboard > Storage & Databases > KV > `student_tasks_dev`. |
| 8 | `08_application_dashboard.png` | Live web application dashboard | Open `https://student-task-manager.vedikapande44.workers.dev/` showing TaskNest UI. |
| 9 | `09_crud_create.png` | Create Task operation | Step 1 in UI: Adding task `"Prepare Final Year Project Presentation"`. |
| 10 | `10_crud_read.png` | View / Read Tasks operation | Step 2 in UI: Task list with search, filter chips, and counter cards. |
| 11 | `11_crud_update.png` | Update Task status | Step 3 in UI: Transitioning status from `Pending` to `Completed` with confetti. |
| 12 | `12_crud_delete.png` | Delete Task confirmation modal | Step 4 in UI: Confirming deletion of a task record from KV. |
| 13 | `13_github_repository.png` | GitHub repository root with complete code structure | View `https://github.com/vedikapande44-spec/student-task-manager-iac`. |
| 14 | `14_github_actions.png` | GitHub Actions CI/CD pipeline execution | View repository **Actions** tab showing green checkmark for `Deploy Student Task Manager`. |
| 15 | `15_terraform_destroy.png` | Automated infrastructure destruction | Run `cd terraform && terraform destroy`. Shows `"Destroy complete! Resources: 3 destroyed."`. |
| 16 | `16_infrastructure_recreation.png` | Reproducible recreation from code | Run `cd terraform && terraform apply`. Proves declarative reproducibility. |

---

## Instructions for Submission
1. Place PNG / JPEG files matching the names above into this directory (`screenshots/`).
2. These screenshots are directly referenced in the Mini Project Report (**Chapter 9: Testing and Results**).
