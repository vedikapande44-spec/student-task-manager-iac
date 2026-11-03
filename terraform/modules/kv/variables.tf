variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "kv_namespace_name" {
  description = "Base title for Workers KV namespace"
  type        = string
  default     = "student_tasks"
}

variable "environment" {
  description = "Deployment environment suffix"
  type        = string
  default     = "dev"
}
