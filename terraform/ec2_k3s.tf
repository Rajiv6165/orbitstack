# Ubuntu 22.04 LTS AMI Lookup
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance running lightweight k3s Kubernetes
resource "aws_instance" "k3s_node" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  subnet_id            = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.k3s_node.id]
  iam_instance_profile = aws_iam_instance_profile.k3s_node.name
  key_name             = var.ssh_key_name != "" ? var.ssh_key_name : null

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e

              # Update packages
              apt-get update -y
              apt-get install -y curl git apt-transport-https ca-certificates software-properties-common

              # Install lightweight single-node k3s cluster
              # Write kubeconfig with 644 permissions for remote retrieval
              curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--write-kubeconfig-mode 644 --tls-san $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" sh -

              # Wait for k3s node to reach Ready state
              echo "Waiting for k3s cluster readiness..."
              until /usr/local/bin/kubectl get nodes | grep -q ' Ready'; do
                sleep 2
              done

              echo "k3s cluster is online and ready for OrbitStack deployments!"
              EOF

  tags = {
    Name                                   = "orbitstack-k3s-node-${var.environment}"
    "kubernetes.io/cluster/orbitstack-k3s" = "owned"
  }
}
