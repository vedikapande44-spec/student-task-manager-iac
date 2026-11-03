# VIVA VOCE PREPARATION & DEMONSTRATION GUIDE

### Project Title
**Automated Deployment of a Serverless Student Task Management Application Using Terraform-Based Infrastructure as Code**

This guide contains the official viva questions, model answers, and step-by-step demonstration checklist based on **Section 30** and **Section 39** of the project specification.

---

## 1. Mandatory 20-Step Live Demonstration Script (Section 30)

During project evaluation, follow this exact sequence to demonstrate full IaC competency:

| Step | Action to Perform | Command / Location | Expected Output / What to Explain to Examiner |
|---|---|---|---|
| **1** | Show Terraform source code | Open `terraform/main.tf`, `providers.tf`, `variables.tf`, `outputs.tf` in editor | Point out the 3 main resources: KV namespace, Worker script, subdomain route. Emphasize no tokens are hardcoded. |
| **2** | Run Terraform validate | `cd terraform && terraform validate` | Explain: Checks HCL syntax, block types, argument names, and attribute types against provider schema. Shows `"Success! The configuration is valid."`. |
| **3** | Run Terraform plan | `terraform plan` | Explain: Terraform refreshes state and calculates delta between declared code and cloud state. |
| **4** | Explain plan symbols | Point to output symbols: `+` (create), `~` (modify), `-` (destroy) | Explain how Terraform computes resource dependency graphs (KV must be created before Worker can bind its namespace ID). |
| **5** | Run Terraform apply | `terraform apply` (or `-auto-approve`) | Explain: Terraform makes REST calls to Cloudflare v4 API and updates `terraform.tfstate`. |
| **6** | Show Worker created | Cloudflare Dashboard > Workers & Pages > `student-task-manager` | Show that Worker script is live with KV binding `TASKS_KV` attached. |
| **7** | Show KV created | Cloudflare Dashboard > KV > `student_tasks_dev` | Show the created KV namespace and namespace ID matching `outputs.tf`. |
| **8** | Open deployed application | Browser > `https://student-task-manager.vedikapande44.workers.dev` | Explain that the single-page application is served directly by the Cloudflare Worker. |
| **9** | Add a task (Create) | Navigate to **1. Create Task** tab in UI | Add: Title: `"Prepare Final Year Project Presentation"`, Priority: `"High"`. Shows created task card with ID `T101`. |
| **10** | Retrieve task (Read) | Navigate to **2. View Tasks** tab in UI | Show the created task in list, test search filter by title, and test lookup by ID. |
| **11** | Update task (Update) | Navigate to **3. Update Task** tab in UI | Select task, advance status from `Pending` to `Completed`, click **Save changes**. Show celebratory confetti and status change. |
| **12** | Delete task (Delete) | Navigate to **4. Delete Task** tab in UI | Click trash icon on task, confirm modal. Verify task is removed from UI and KV storage. |
| **13** | Modify Terraform configuration | Edit `terraform/variables.tf` (e.g. change `environment` from `"dev"` to `"staging"`) | Explain that IaC allows managing configuration changes through version-controlled files. |
| **14** | Run Terraform plan again | `terraform plan` | Show that Terraform detects **in-place update** (`~ update in-place`) on the Worker environment variable and KV title without recreating the Worker. |
| **15** | Explain detected difference | Review terminal plan diff | Show lines marked with `~` indicating attribute changes. |
| **16** | Apply the modification | `terraform apply` | Verify update completes in seconds. |
| **17** | Show GitHub repository | GitHub web page: `student-task-manager-iac` | Show organized directory structure, `.gitignore` protecting secrets, and commit history. |
| **18** | Show GitHub Actions pipeline | GitHub Actions tab | Show the automated workflow executing format check, init, validate, plan, and apply. |
| **19** | Run Terraform destroy | `terraform destroy -auto-approve` | Show all 3 resources being removed from Cloudflare. Refresh dashboard to prove resources are gone. |
| **20** | Recreate infrastructure | `terraform apply -auto-approve` | Show the entire cloud environment resurrected in ~15 seconds strictly from configuration code. |

---

## 2. Viva Voce Questions & High-Scoring Answers (Section 39)

### Basic Level Questions

#### Q1. What is Infrastructure as Code (IaC)?
**Answer**: Infrastructure as Code is the engineering practice of defining, provisioning, and managing IT infrastructure—such as compute runtimes, databases, networks, and DNS settings—using version-controlled, machine-readable declarative code files rather than manually configuring resources through interactive cloud web dashboards.

#### Q2. Which IaC tool have you used and why?
**Answer**: We used **HashiCorp Terraform**. Terraform was chosen because it is cloud-agnostic, uses an intuitive declarative language (HCL - HashiCorp Configuration Language), maintains state tracking to detect drift, and officially supports Cloudflare via the official `cloudflare/cloudflare` provider.

#### Q3. Which cloud provider have you used?
**Answer**: We used **Cloudflare**. Cloudflare provides global edge hosting with over 300 data centers worldwide, near-instant propagation, integrated security and SSL, and an extensive Free tier allowing 100,000 Worker requests per day.

#### Q4. Which compute service have you used?
**Answer**: We used **Cloudflare Workers**. It is a serverless execution environment running on Google V8 isolates, providing zero cold-start execution times, global low-latency response times, and native bindings to KV storage.

#### Q5. Which storage service have you used?
**Answer**: We used **Cloudflare Workers KV**. It is a highly scalable, globally distributed key-value data store optimized for high-volume, low-latency reads.

---

### Intermediate Level Questions

#### Q6. What does `terraform init` do?
**Answer**: `terraform init` initializes the working directory containing Terraform configuration files. Specifically, it:
1. Reads provider requirements in `providers.tf`.
2. Downloads and installs required provider plugins (e.g., `cloudflare/cloudflare v5.28.0`) into the `.terraform` folder.
3. Generates or updates the dependency lock file (`.terraform.lock.hcl`).
4. Configures the backend storage for the state file.

#### Q7. What does `terraform plan` do?
**Answer**: `terraform plan` creates an execution plan. It queries the current real-world state of the cloud resources via provider APIs, compares this against the declared configuration files, and displays an execution plan showing exactly what changes Terraform will make (marked with `+` for add, `~` for change, `-` for destroy) without actually applying any changes.

#### Q8. What does `terraform apply` do?
**Answer**: `terraform apply` executes the actions described in the execution plan. It calls the cloud provider's APIs in the correct dependency order to create, update, or remove resources, and then records the resulting infrastructure attributes and IDs into `terraform.tfstate`.

#### Q9. What does `terraform destroy` do?
**Answer**: `terraform destroy` tears down and deletes all resources managed by the current Terraform state file in reverse dependency order, ensuring no dangling resources or unexpected cloud costs remain.

#### Q10. What is Terraform state and why is it crucial?
**Answer**: Terraform state (`terraform.tfstate`) is a persistent JSON record of all managed infrastructure. It maps declared resource names (like `cloudflare_workers_kv_namespace.tasks`) to real-world cloud IDs (like `4c3ce4fd7e3946daaf827cfb48ab2553`). It tracks dependencies, cached attributes, and metadata. Without state, Terraform cannot know which real-world resources belong to which code blocks.

---

### Advanced Level Questions

#### Q11. What is infrastructure drift?
**Answer**: Infrastructure drift occurs when the actual state of resources in the cloud differs from the state recorded in Terraform's configuration and state files. Drift typically happens when an administrator manually modifies or deletes a resource via the cloud web console. Terraform detects drift during `terraform plan` by refreshing state against live cloud APIs.

#### Q12. What happens if someone manually changes a Terraform-managed resource in the Cloudflare dashboard?
**Answer**: When `terraform plan` is next run, Terraform refreshes state by querying the Cloudflare API, detects the discrepancies between the live resource and the HCL configuration file, and generates a plan to revert the cloud resource back to match the declared HCL code.

#### Q13. Why use variables in Terraform?
**Answer**: Variables prevent hardcoding, increase code reuse, and enable identical infrastructure code to be deployed across multiple environments (e.g., `dev.tfvars`, `prod.tfvars`) by injecting distinct environment names, subdomains, or scaling tiers at runtime.

#### Q14. Why use Terraform modules?
**Answer**: Modules are self-contained packages of Terraform configurations that encapsulate reusable components (e.g., a standardized serverless worker with logging and storage). They improve code organization, reduce duplication, and enable standard enterprise design patterns.

#### Q15. What advantages does Git provide for Infrastructure as Code?
**Answer**:
1. **Auditability**: Complete history of every infrastructure change, who made it, and why.
2. **Collaboration**: Code reviews and pull requests before changing infrastructure.
3. **Rollback**: If an infrastructure change causes an outage, reverting the git commit allows Terraform to restore the previous stable infrastructure state.
4. **Automated CI/CD**: Pushing to Git triggers automated linting, validation, and provisioning via GitHub Actions.

#### Q16. Why must API tokens never be committed to Git?
**Answer**: Committing secrets into version control exposes credentials to unauthorized parties, leads to secret leaks in public repositories, enables malicious takeovers of cloud infrastructure, and violates security compliance. Secrets must always be passed securely through environment variables (`CLOUDFLARE_API_TOKEN`) or GitHub Actions encrypted repository secrets.

#### Q17. How does eventual consistency affect Cloudflare Workers KV?
**Answer**: Workers KV is optimized for ultra-fast, globally replicated reads. When a write or delete operation occurs, changes are immediately consistent in the primary region, but global propagation across 300+ edge nodes takes a few seconds. Applications accommodate this by setting appropriate `Cache-Control: no-store` headers on dynamic API routes.

---

## 3. Quick Terminal Reference Cheat Sheet for Viva

```powershell
# 1. Format check
terraform fmt -check

# 2. Configuration validation
terraform validate

# 3. Plan review
terraform plan

# 4. Provision
terraform apply -auto-approve

# 5. Inspect state
terraform show

# 6. View outputs
terraform output

# 7. Automated API test
python scripts/verify_api.py

# 8. Destroy infrastructure
terraform destroy -auto-approve
```
