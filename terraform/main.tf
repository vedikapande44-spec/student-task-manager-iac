locals {
  # Frontend files padh ke Worker code me inject karte hain
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

# 1. Workers KV namespace (task storage)
resource "cloudflare_workers_kv_namespace" "tasks" {
  account_id = var.account_id
  title      = "${var.kv_namespace_name}_${var.environment}"
}

# 2. Cloudflare Worker + KV binding + environment variable
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

# 3. workers.dev URL enable karna
resource "cloudflare_workers_script_subdomain" "task_manager" {
  account_id  = var.account_id
  script_name = cloudflare_workers_script.task_manager.script_name
  enabled     = true
}