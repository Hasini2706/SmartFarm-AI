# Docker Deployment Configurations

This folder is reserved for additional Docker deployment configurations and scripts.

- Production-ready configurations are orchestrating the platform services.
- The `Dockerfile` configurations are stored locally inside the respective service folders:
  - `backend/Dockerfile` - Python FastAPI container
  - `frontend/Dockerfile` - React + Vite + Nginx multi-stage build container
  - `docker-compose.yml` - Root directory orchestrator file

To run the containerized app from root:
```bash
docker-compose up --build
```
