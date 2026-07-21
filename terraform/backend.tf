# Terraform S3 Remote State Backend Configuration
# 
# Usage Note:
# 1. On initial setup, run `terraform apply` to create the S3 bucket and DynamoDB lock table in `s3_backend.tf`.
# 2. Then uncomment the `backend "s3"` block below and run `terraform init` to migrate state to S3.

# terraform {
#   backend "s3" {
#     bucket         = "orbitstack-tfstate-backend-unique-id"
#     key            = "orbitstack/production/terraform.tfstate"
#     region         = "us-east-1"
#     dynamodb_table = "orbitstack-tf-locks"
#     encrypt        = true
#   }
# }
