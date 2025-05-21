#!/bin/bash

echo "Stopping API Gateway..."
docker-compose stop api-gateway

echo "Removing API Gateway container..."
docker-compose rm -f api-gateway

echo "Building API Gateway..."
docker-compose build api-gateway

echo "Starting API Gateway..."
docker-compose up -d api-gateway

echo "Checking logs..."
docker-compose logs -f api-gateway
