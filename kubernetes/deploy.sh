MINIKUBE_IP=$(minikube ip)

if [ -z "$MINIKUBE_IP" ]; then
    echo "Error: Could not get Minikube IP"
    exit 1
fi

echo "Detected Minikube IP: $MINIKUBE_IP"

cp configmap.yaml configmap.yaml.bak
sed -i "s/PLACEHOLDER_IP/$MINIKUBE_IP/g" configmap.yaml


kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml
kubectl apply -f mysql-pv.yaml
kubectl apply -f mysql-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml


mv configmap.yaml.bak configmap.yaml

echo "Deployment completed with Minikube IP: $MINIKUBE_IP"


frontendUrl="http://$MINIKUBE_IP:30080"
backendUrl="http://$MINIKUBE_IP:31881"

echo "Frontend URL: $frontendUrl"
echo "Backend URL: $backendUrl"
