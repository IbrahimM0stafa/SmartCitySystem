# Smart City System

Smart City System is a real-time monitoring platform designed to visualize environmental and traffic sensor data. It integrates sensor input with dashboards to help urban planners and citizens make data-driven decisions.

## 🎥 Demo Video

[![Smart City System Demo](https://img.youtube.com/vi/QJFu0HMIXE4/maxresdefault.jpg)](https://youtu.be/QJFu0HMIXE4)

[📹 Watch Full Demo Video](https://youtu.be/QJFu0HMIXE4)

## 🔧 Tech Stack

- **Frontend**: Angular 16+  
- **Backend**: Spring Boot (Java 21)  
- **Database**: MySQL  
- **CI/CD**: Jenkins  
- **DevOps**: Docker, Docker Compose, OpenShift, Kubernetes  
- **Auth**: Google OAuth 2.0 + JWT  

## 🚀 Features

- Real-time dashboards for traffic, pollution, and lighting  
- Threshold alert system  
- Admin management & user interface  
- CI/CD automation with Jenkins  
- Docker-based deployment  
- OpenShift and Kubernetes support

## ⚙️ Local Development

### Prerequisites

- Docker & Docker Compose  
- Java 21  
- Node.js + npm  
- MySQL  

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd DXC
./mvnw clean install
./mvnw spring-boot:run
```

## 🐳 Deployment with Docker Compose

### 1. Log in to DockerHub

```bash
#example:
docker login -u ibrahimtalaat
# Token will be prompted
```

### 2. Build & Push Docker Images

```bash
chmod +x build_and_push.sh
./build_and_push.sh
```

### 3. Create `.env` file  

Only required once. Make sure it's properly configured.

### 4. Run the System

```bash
docker compose up -d
```

### 5. Monitor Logs

```bash
docker logs backend-container
docker logs -f backend-container
```

## ☁️ OpenShift Deployment

### Prerequisites

- OpenShift CLI (`oc`) installed
- Access to OpenShift cluster
- Required YAML files in `openshift/` directory

### Deployment Steps

```bash
# Login to OpenShift cluster
oc login --token=sha256~kioV6MlO9Dilm2X1ORYTEoh-T9DB4QkDOXXJkfFHaJU --server=https://api.rm3.7wse.p1.openshiftapps.com:6443

# Navigate to OpenShift configuration directory
cd "C:\Users\CompuMarts\Desktop\DxcGithub\SmartCitySystem\openshift"

# Apply configuration files
oc apply -f configmap.yaml
oc apply -f secrets.yaml
oc apply -f mysql-pv.yaml
oc apply -f mysql-deployment.yaml
oc apply -f backend-deployment.yaml
oc apply -f frontend-deployment.yaml
```

### Expose Services (First Time Only)

```bash
# Expose frontend and backend services
oc expose service frontend --name=frontend-route
oc expose service backend --name=backend-route
```

### Update and Restart Deployments

```bash
# Update config map and restart deployments
oc rollout restart deployment/backend
oc rollout restart deployment/frontend

# Wait for rollouts to complete
oc rollout status deployment/backend
oc rollout status deployment/frontend
```

### Debugging Commands

```bash
# Check routes
oc get routes

# Get all resources
oc get all

# Check pod status
oc get pods

# View logs
oc logs deployment/backend
oc logs deployment/frontend
oc logs deployment/mysql
```

### Live Demo (OpenShift)

- **Frontend**: https://frontend-route-ibrahimmostafa768-dev.apps.rm3.7wse.p1.openshiftapps.com
- **Backend API**: https://backend-route-ibrahimmostafa768-dev.apps.rm3.7wse.p1.openshiftapps.com

## ⚙️ Kubernetes Deployment

### Prerequisites

- Minikube installed
- kubectl CLI tool
- Hyper-V enabled (for Windows)

### Start Minikube

```bash
# Start minikube with hyperv driver
minikube start --driver=hyperv --no-vtx-check

# Get minikube IP address
minikube ip
```

### Automated Deployment

Navigate to Kubernetes configuration directory:

```bash
cd "C:\Users\CompuMarts\Desktop\DxcGithub\SmartCitySystem\kubernetes"
```

#### Option 1: Using Deploy Scripts (Recommended)

The deploy scripts automatically adjust the ConfigMap with your Minikube IP and apply all YAML files.

**For Git Bash:**
```bash
./deploy.sh
```

**For PowerShell:**
```bash
./deploy.ps1
```

#### Option 2: Manual Deployment

```bash
# Apply configurations in order
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml
kubectl apply -f mysql-pv.yaml
kubectl apply -f mysql-deployment.yaml

# Wait for MySQL pod to be ready before proceeding
kubectl wait --for=condition=ready pod -l app=mysql -n smartcity --timeout=300s 

# Deploy backend and frontend
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

### Update Deployments

After updating backend and frontend images in the repository:

```bash
# Restart deployments
kubectl rollout restart deployment backend -n smartcity
kubectl rollout restart deployment frontend -n smartcity
```

Or use the update scripts:

**For Git Bash:**
```bash
./update-ip.sh
```

**For PowerShell:**
```bash
./update-ip.ps1
```

## 🔧 Jenkins Setup

### Step 1 – Build Jenkins Docker Image & Run Container

```bash
docker build -t custom-jenkins-docker .
docker run -d --name jenkins-docker \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  custom-jenkins-docker
```

## 🧪 CI/CD with Jenkinsfile

### Step 1 – Add Jenkins Credentials (only once)  

Add these credentials in Jenkins → **Manage Jenkins → Credentials → (Global):**

- `ibrahimtalaat-dockerhub`: DockerHub login  
- `mysql-root-password`  
- `mysql-db`  
- `mysql-user`  
- `mysql-password`  
- `jwt-secret`  
- `mail-username`  
- `mail-password`  
- `google-client-id`  
- `google-client-secret`  

### Step 2 – Run Jenkins Image (if not done)  

See "Jenkins Setup" section above.

### Option A – Build via Pipeline Script (manual)

- Copy contents of the `Jenkinsfile` into the **Pipeline script** field in Jenkins.  
- Click **Build Now**.

### Option B – GitHub SCM Integration (recommended)

1. Ensure `Jenkinsfile` is committed to root of repo.  
2. In Jenkins:  
   - Create or configure a **Pipeline** project.  
   - Choose **Pipeline script from SCM**.  
   - Set:  
     - **SCM**: Git  
     - **Repository URL**: `https://github.com/IbrahimM0stafa/SmartCitySystem.git`  
     - **Branch**: `*/main`  
     - **Script Path**: `Jenkinsfile`  
   - Click **Save**, then **Build Now**.

## 📁 Project Structure

```
SmartCitySystem/
├── .idea/                    # IDE configuration files
├── BackendSonarQube/        # SonarQube backend analysis
├── Jenkins/                 # Jenkins configuration files
├── dxc/                     # Spring Boot backend application
├── frontend/                # Angular frontend application
├── frontendSonarQube/       # SonarQube frontend analysis
├── kubernetes/              # Kubernetes deployment files
├── openshift/               # OpenShift deployment files
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── Jenkinsfile             # CI/CD pipeline configuration
├── README.md               # Project documentation
└── docker-compose.yml      # Docker Compose configuration
```
