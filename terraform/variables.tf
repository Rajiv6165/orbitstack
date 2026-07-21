variable "aws_region" {
  description = "AWS region for provisioning OrbitStack infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for OrbitStack VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "availability_zones" {
  description = "Availability zones for subnet placement"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "instance_type" {
  description = "EC2 instance type for k3s cluster node ($0.0416/hr vs $0.10/hr EKS control plane)"
  type        = string
  default     = "t3.medium"
}

variable "ssh_key_name" {
  description = "Optional existing EC2 keypair name for SSH access"
  type        = string
  default     = ""
}

variable "allowed_ssh_cidr" {
  description = "Allowed CIDR block for SSH access (e.g. your IP/32)"
  type        = string
  default     = "0.0.0.0/0"
}
