output "script_name" {
  description = "Deployed Worker script name"
  value       = cloudflare_workers_script.this.script_name
}

output "application_url" {
  description = "Public URL of the deployed application"
  value       = "https://${cloudflare_workers_script.this.script_name}.${var.workers_subdomain}.workers.dev"
}
