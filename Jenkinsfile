pipeline {
  agent any

  options {
    skipDefaultCheckout(true) 
  }

  environment {
    DOCKER_REGISTRY = "ibrahimtalaat"
    BACKEND_IMAGE = "${DOCKER_REGISTRY}/dxc-backend"
    FRONTEND_IMAGE = "${DOCKER_REGISTRY}/dxc-frontend"
    COMPOSE_FILE = "/docker-compose.yml"
  }

  stages {
    
    stage('Checkout Code') {
      steps {
        checkout scm
    }
  }

    stage('Build Backend Image') {
      steps {
        script {
          docker.build("${BACKEND_IMAGE}:latest", "-f DXC/Dockerfile DXC")
        }
      }
    }

    stage('Build Frontend Image') {
      steps {
        script {
          docker.build("${FRONTEND_IMAGE}:latest", "-f frontend/Dockerfile frontend")
        }
      }
    }

    stage('Push Images') {
      steps {
        withDockerRegistry(credentialsId: 'ibrahimtalaat-dockerhub', url: '') {
          script {
            docker.image("${BACKEND_IMAGE}:latest").push()
            docker.image("${FRONTEND_IMAGE}:latest").push()
          }
        }
      }
    }

    stage('Deploy with Docker Compose') {
      steps {
        withCredentials([
          string(credentialsId: 'mysql-root-password', variable: 'MYSQL_ROOT_PASSWORD'),
          string(credentialsId: 'mysql-user', variable: 'MYSQL_USER'),
          string(credentialsId: 'mysql-password', variable: 'MYSQL_PASSWORD'),
          string(credentialsId: 'mysql-db', variable: 'MYSQL_DATABASE'),
          string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
          string(credentialsId: 'mail-username', variable: 'MAIL_USERNAME'),
          string(credentialsId: 'mail-password', variable: 'MAIL_PASSWORD'),
          string(credentialsId: 'google-client-id', variable: 'GOOGLE_CLIENT_ID'),
          string(credentialsId: 'google-client-secret', variable: 'GOOGLE_CLIENT_SECRET')
        ]) {
          withEnv([
            "MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}",
            "MYSQL_USER=${MYSQL_USER}",
            "MYSQL_PASSWORD=${MYSQL_PASSWORD}",
            "MYSQL_DATABASE=${MYSQL_DATABASE}",
            "JWT_SECRET=${JWT_SECRET}",
            "MAIL_USERNAME=${MAIL_USERNAME}",
            "MAIL_PASSWORD=${MAIL_PASSWORD}",
            "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}",
            "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}"
          ]) {
            script {
              sh '''
                docker-compose -f docker-compose.yml down --remove-orphans || true

                docker rm -f mysql-container || true
                docker rm -f backend-container || true
                docker rm -f smartcity-frontend || true

                docker-compose -f docker-compose.yml up -d --pull always
              '''
            }
          }
        }
      }
    }

    stage('Health Check') {
      steps {
        script {
          sleep(time: 30, unit: 'SECONDS')
          sh 'docker ps --filter name=mysql-container --format "table {{.Names}}\t{{.Status}}"'
          sh 'docker ps --filter name=backend-container --format "table {{.Names}}\t{{.Status}}"'
          sh 'docker ps --filter name=smartcity-frontend --format "table {{.Names}}\t{{.Status}}"'
        }
      }
    }
  }

  post {
    success {
      echo 'Deployment completed successfully!'
    }
    failure {
      echo 'Deployment failed!'
    }
  }
}
