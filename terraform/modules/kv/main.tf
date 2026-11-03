terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

resource "cloudflare_workers_kv_namespace" "this" {
  account_id = var.account_id
  title      = "${var.kv_namespace_name}_${var.environment}"
}
