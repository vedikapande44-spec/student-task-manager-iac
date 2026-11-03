output "id" {
  description = "Unique ID of the provisioned KV namespace"
  value       = cloudflare_workers_kv_namespace.this.id
}

output "title" {
  description = "Title of the provisioned KV namespace"
  value       = cloudflare_workers_kv_namespace.this.title
}
