MINIKUBE_IP=$(minikube ip)
NAMESPACE="smartcity"

if [ -z "$MINIKUBE_IP" ]; then
    echo "Error: Could not get Minikube IP"
    exit 1
fi

echo "Updating ConfigMap with IP: $MINIKUBE_IP"

kubectl patch configmap app-config -n $NAMESPACE --patch "
data:
  MINIKUBE_IP: \"$MINIKUBE_IP\"
  FRONTEND_URL: \"http://$MINIKUBE_IP:30080\"
  BACKEND_URL: \"http://$MINIKUBE_IP:31881\"
"

kubectl rollout restart deployment/frontend -n $NAMESPACE
kubectl rollout restart deployment/backend -n $NAMESPACE

echo "Updated and restarted deployments with new IP: $MINIKUBE_IP"