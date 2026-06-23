# Kubernetes Sample (Kustomize) - webapp-fms (Personal AWS)

Deploy the [Docker](../Dockerfile) nginx image on Kubernetes using Kustomize overlays.

## Prerequisites

- `kubectl` configured for your cluster
- Docker image built and available to the cluster (local: `imagePullPolicy: Never` not set. PUSH to ECR for cloud EKS)
- For ALB Ingress: AWS Load Balancer Controller installed
- For Fargate overlay: Fargate profile selecting namespace `webapp-fms`

## Image URI

Edit `k8s/base/kustomization.yaml` `images:` before cloud deploy:

```yaml
images:
  - name: webapp-fms
    newName: <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/webapp-fms
    newTag: latest
```

## Apply: EC2 workers

```bash
kubectl apply -k k8s/overlays/ec2
```

Schedules pods on EC2 managed node groups (`eks.amazonaws.com/compute-type: ec2`).

## Apply: Fargate

```bash
kubectl apply -k k8s/overlays/fargate
```

Requires Fargate profile for namespace `webapp-fms`. Pods need resource requests (patched in this overlay).

## Toggle compute type

Switch overlays with a single apply (rolling restart):

```bash
kubectl apply -k k8s/overlays/ec2
# or
kubectl apply -k k8s/overlays/fargate
```

## Verify (port-forward, no ALB required)

```bash
kubectl get pods -n webapp-fms
kubectl port-forward -n webapp-fms svc/webapp-fms 8080:80
```

```bash
curl -I http://localhost:8080/demo/fms/
curl -s http://localhost:8080/demo/fms/api/files
```

Open **http://localhost:8080/demo/fms/** in a browser for upload test.

## Validate manifests (no cluster)

```bash
kubectl apply -k k8s/overlays/ec2 --dry-run=client
kubectl apply -k k8s/overlays/fargate --dry-run=client
```

## Layout

```
k8s/
  base/           # namespace, deployment, service, ingress
  overlays/
    ec2/          # nodeSelector for EC2 workers
    fargate/      # Fargate resource requests
```

## CORS

| Call | Origin | Notes |
|------|--------|-------|
| Presign / list | Same origin as web app | Proxied by nginx in image |
| S3 PUT | S3 URL | S3 bucket CORS must allow your Ingress/ALB origin |

## Related

- [DOCKER.md](../DOCKER.md) - build and run the image locally
