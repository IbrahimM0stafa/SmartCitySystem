$NAMESPACE = "smartcity"
$MINIKUBE_IP = & minikube ip

if ([string]::IsNullOrEmpty($MINIKUBE_IP)) {
    Write-Error "Error: Could not get Minikube IP"
    exit 1
}

Write-Output "Updating ConfigMap with IP: $MINIKUBE_IP"

$patch = @{
    data = @{
        MINIKUBE_IP = $MINIKUBE_IP
        FRONTEND_URL = "http://$MINIKUBE_IP+:30080"
        BACKEND_URL = "http://$MINIKUBE_IP+:31881"
    }
} | ConvertTo-Json -Depth 3

kubectl patch configmap app-config -n $NAMESPACE --patch $patch

kubectl rollout restart deployment/frontend -n $NAMESPACE
kubectl rollout restart deployment/backend -n $NAMESPACE

Write-Output "Updated and restarted deployments with new IP: $MINIKUBE_IP"
