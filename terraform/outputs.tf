output "k3s_node_public_ip" {
  description = "Public IP address of the OrbitStack k3s cluster EC2 node"
  value       = aws_instance.k3s_node.public_ip
}

output "k3s_node_public_dns" {
  description = "Public DNS hostname of the EC2 node"
  value       = aws_instance.k3s_node.public_dns
}

output "kubeconfig_retrieval_command" {
  description = "Command to fetch kubeconfig from the k3s node for local kubectl management"
  value       = "scp -i <your-ssh-key.pem> ubuntu@${aws_instance.k3s_node.public_ip}:/etc/rancher/k3s/k3s.yaml ~/.kube/config && sed -i 's/127.0.0.1/${aws_instance.k3s_node.public_ip}/g' ~/.kube/config"
}

output "s3_backend_bucket_name" {
  description = "Name of the S3 bucket created for Terraform remote state"
  value       = aws_s3_bucket.terraform_state.id
}

output "dynamodb_lock_table_name" {
  description = "Name of the DynamoDB table created for state locking"
  value       = aws_dynamodb_table.terraform_locks.name
}

output "hourly_cost_estimate" {
  description = "Approximate hourly cloud cost for this environment"
  value       = "~$0.0416 / hour (t3.medium: ~$30/month vs ~$100+/month for managed EKS control plane). Run 'terraform destroy' when finished demoing."
}
