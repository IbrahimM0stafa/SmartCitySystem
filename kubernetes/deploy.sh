MINIKUBE_IP=$(minikube ip)

if [ -z "$MINIKUBE_IP" ]; then
    echo "Error: Could not get Minikube IP"
    exit 1
fi

echo "Detected Minikube IP: $MINIKUBE_IP"

sed -i.bak "s/PLACEHOLDER_IP/$MINIKUBE_IP/g" configmap.yaml

kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml
kubectl apply -f mysql-pv.yaml
kubectl apply -f mysql-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

mv configmap.yaml.bak configmap.yaml

echo "Deployment completed with Minikube IP: $MINIKUBE_IP"
echo "Frontend URL: http://$MINIKUBE_IP:30080"
echo "Backend URL: http://$MINIKUBE_IP:31881"