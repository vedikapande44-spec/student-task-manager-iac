variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "worker_name" {
  description = "Name of the Cloudflare Worker"
  type        = string
  default     = "student-task-manager"
}

variable "kv_namespace_name" {
  description = "Name of the Workers KV namespace"
  type        = string
  default     = "student_tasks"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "workers_subdomain" {
  description = "Your account's workers.dev subdomain (the part before .workers.dev)"
  type        = string
}