Install OpenTelemetry Libraries:
=================================

Node Instrumentation
-------------------

npm install @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node



Manual Instrumentation Setup:
-----------------------------
npm install @opentelemetry/api @opentelemetry/resources @opentelemetry/semantic-conventions

  

Project:
============================
nvm use default 20.18.0
Installation:
-----------------------------------
01-BASIC TRACE
--------------
docker compose up -d --force-recreate