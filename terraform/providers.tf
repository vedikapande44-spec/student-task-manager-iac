terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# Token yahan nahi likhte. Provider apne aap
# CLOUDFLARE_API_TOKEN environment variable se padh leta hai.
provider "cloudflare" {}