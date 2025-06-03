# Smart City System
Smart City System is a real-time monitoring platform designed to visualize environmental and traffic sensor data. It integrates sensor input with dashboards to help urban planners and citizens make data-driven decisions.

## 🔧 Tech Stack

- **Frontend**: Angular 16+  
- **Backend**: Spring Boot (Java 21)  
- **Database**: MySQL  
- **CI/CD**: Jenkins  
- **DevOps**: Docker, Docker Compose  
- **Auth**: Google OAuth 2.0 + JWT  

## 🚀 Features

- Real-time dashboards for traffic, pollution, and lighting  
- Threshold alert system  
- Admin management & user interface  
- CI/CD automation with Jenkins  
- Docker-based deployment  

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
ng serve
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

## ⚙️ Jenkins Setup

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
See “Jenkins Setup” section above.

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

## 📫 Contact  
For issues or feature requests, please open an issue or contact **Ibrahim Mostafa**.
