resource "aws_security_group" "k3s_node" {
  name        = "orbitstack-k3s-sg-${var.environment}"
  description = "Security group for OrbitStack k3s cluster node"
  vpc_id      = aws_vpc.main.id

  # Ingress: SSH (port 22)
  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  # Ingress: HTTP (port 80) for NGINX Ingress
  ingress {
    description = "HTTP Web Traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Ingress: HTTPS (port 443) for NGINX Ingress
  ingress {
    description = "HTTPS Web Traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Ingress: Kubernetes API Server (port 6443)
  ingress {
    description = "k3s Kubernetes API Server"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  # Egress: Allow all outbound traffic (Package downloads, container registries)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "orbitstack-k3s-sg-${var.environment}"
  }
}
