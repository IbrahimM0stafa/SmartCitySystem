$MINIKUBE_IP = & minikube ip

if ([string]::IsNullOrEmpty($MINIKUBE_IP)) {
    Write-Error "Error: Could not get Minikube IP"
    exit 1
}

Write-Output "Detected Minikube IP: $MINIKUBE_IP"

Copy-Item -Path "configmap.yaml" -Destination "configmap.yaml.bak" -Force
(Get-Content configmap.yaml) -replace 'PLACEHOLDER_IP', $MINIKUBE_IP | Set-Content configmap.yaml

kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml
kubectl apply -f mysql-pv.yaml
kubectl apply -f mysql-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

Move-Item -Path "configmap.yaml.bak" -Destination "configmap.yaml" -Force

Write-Output "Deployment completed with Minikube IP: $MINIKUBE_IP"

$frontendUrl = "http://" + $MINIKUBE_IP + ":30080"
$backendUrl = "http://" + $MINIKUBE_IP + ":31881"

Write-Output "Frontend URL: $frontendUrl"
Write-Output "Backend URL: $backendUrl"
