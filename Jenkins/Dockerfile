# Start from the official Jenkins LTS image
FROM jenkins/jenkins:lts

# Switch to root to install Docker
USER root

# Install Docker CLI inside the container
RUN apt-get update && \
    apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list && \
    apt-get update && \
    apt-get install -y docker.io && \
    apt-get clean

# Safely add Jenkins user to the existing 'docker' group (skip groupadd)
RUN usermod -aG docker jenkins

# Switch back to Jenkins user
USER jenkins
