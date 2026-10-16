output "worker_name" {
  description = "Name of the deployed Worker"
  value       = cloudflare_workers_script.task_manager.script_name
}

output "kv_namespace_id" {
  description = "ID of the KV namespace"
  value       = cloudflare_workers_kv_namespace.tasks.id
}

output "application_url" {
  description = "Public URL of the application"
  value       = "https://${var.worker_name}.${var.workers_subdomain}.workers.dev"
}