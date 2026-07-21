# IAM Role for k3s EC2 Instance
resource "aws_iam_role" "k3s_node" {
  name = "orbitstack-k3s-node-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "orbitstack-k3s-node-role"
  }
}

# Attach SSM Policy for Session Manager (Optional secure access without SSH keys)
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.k3s_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach CloudWatch Agent Policy for Logs & Metrics
resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.k3s_node.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# EC2 Instance Profile
resource "aws_iam_instance_profile" "k3s_node" {
  name = "orbitstack-k3s-node-profile-${var.environment}"
  role = aws_iam_role.k3s_node.name
}
