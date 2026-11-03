variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "worker_name" {
  description = "Script name for the Worker"
  type        = string
  default     = "student-task-manager"
}

variable "content" {
  description = "Worker bundled JavaScript code"
  type        = string
}

variable "kv_namespace_id" {
  description = "ID of the bound Workers KV namespace"
  type        = string
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "dev"
}

variable "workers_subdomain" {
  description = "Account workers.dev subdomain prefix"
  type        = string
}
