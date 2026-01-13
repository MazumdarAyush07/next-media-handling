pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }

  environment {
    APP_NAME = "reelspro"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
          docker build -t $APP_NAME:$BRANCH_NAME .
        '''
      }
    }

    stage('Deploy') {
      steps {
        script {

          if (env.BRANCH_NAME == 'dev') {
            sh '''
              docker rm -f reelspro-dev || true
              docker run -d \
                -p 3000:3000 \
                --env-file /home/ubuntu/env/reelspro.dev \
                --name reelspro-dev \
                reelspro:dev
            '''
          }

          if (env.BRANCH_NAME == 'main') {
            sh '''
              docker rm -f reelspro-prod || true
              docker run -d \
                -p 80:3000 \
                --env-file /home/ubuntu/env/reelspro.prod \
                --name reelspro-prod \
                reelspro:main
            '''
          }

        }
      }
    }

    stage('Cleanup') {
      steps {
        sh 'docker image prune -af'
      }
    }
  }
}
