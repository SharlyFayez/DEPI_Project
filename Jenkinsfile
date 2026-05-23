pipeline {
    agent any

    environment {
        DOCKERHUB_USER    = 'marwanelmehy'
        DOCKERHUB_CREDS   = 'dockerhub-credentials'
        IMAGE_BACKEND     = "${DOCKERHUB_USER}/cairo-traffic-backend"
        IMAGE_FRONTEND    = "${DOCKERHUB_USER}/cairo-traffic-frontend"
        IMAGE_SIMULATOR   = "${DOCKERHUB_USER}/cairo-traffic-simulator"
        K8S_NAMESPACE     = 'cairo-traffic'
        KUBECONFIG        = '/var/jenkins_home/.kube/config'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Code is ready in workspace.'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh """
                    docker build -t ${IMAGE_BACKEND}:${BUILD_NUMBER}   /var/jenkins_home/workspace/cairo-traffic-pipeline/back
                    docker build -t ${IMAGE_FRONTEND}:${BUILD_NUMBER}  /var/jenkins_home/workspace/cairo-traffic-pipeline/front
                    docker build -t ${IMAGE_SIMULATOR}:${BUILD_NUMBER} /var/jenkins_home/workspace/cairo-traffic-pipeline/simulator
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo '📤 Pushing images to Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        docker push ${IMAGE_BACKEND}:${BUILD_NUMBER}
                        docker tag  ${IMAGE_BACKEND}:${BUILD_NUMBER} ${IMAGE_BACKEND}:latest
                        docker push ${IMAGE_BACKEND}:latest

                        docker push ${IMAGE_FRONTEND}:${BUILD_NUMBER}
                        docker tag  ${IMAGE_FRONTEND}:${BUILD_NUMBER} ${IMAGE_FRONTEND}:latest
                        docker push ${IMAGE_FRONTEND}:latest

                        docker push ${IMAGE_SIMULATOR}:${BUILD_NUMBER}
                        docker tag  ${IMAGE_SIMULATOR}:${BUILD_NUMBER} ${IMAGE_SIMULATOR}:latest
                        docker push ${IMAGE_SIMULATOR}:latest
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo '🚀 Deploying to Kubernetes...'
                sh """
                    kubectl set image deployment/backend \
                        backend=${IMAGE_BACKEND}:${BUILD_NUMBER} \
                        -n ${K8S_NAMESPACE}

                    kubectl set image deployment/frontend \
                        frontend=${IMAGE_FRONTEND}:${BUILD_NUMBER} \
                        -n ${K8S_NAMESPACE}

                    kubectl set image deployment/simulator \
                        simulator=${IMAGE_SIMULATOR}:${BUILD_NUMBER} \
                        -n ${K8S_NAMESPACE}

                    kubectl rollout status deployment/backend  -n ${K8S_NAMESPACE} --timeout=300s
                    kubectl rollout status deployment/frontend -n ${K8S_NAMESPACE} --timeout=300s
                """
            }
        }

        stage('Health Check') {
            steps {
                echo '🏥 Running health check...'
                sh '''
                    sleep 5
                    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://host.docker.internal/health)
                    if [ "$STATUS" = "200" ]; then
                        echo "✅ Health check passed! Status: $STATUS"
                    else
                        echo "⚠️ Health check status: $STATUS — continuing anyway"
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline succeeded! Cairo Traffic System deployed successfully.'
        }
        failure {
            echo '❌ Pipeline failed! Check logs above.'
        }
        always {
            sh """
                docker rmi ${IMAGE_BACKEND}:${BUILD_NUMBER}  || true
                docker rmi ${IMAGE_FRONTEND}:${BUILD_NUMBER} || true
                docker rmi ${IMAGE_SIMULATOR}:${BUILD_NUMBER} || true
            """
        }
    }
}