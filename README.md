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
npm install    @opentelemetry/api 
npm install    @opentelemetry/auto-instrumentations-node 
npm install    @opentelemetry/exporter-prometheus
npm install    @opentelemetry/exporter-zipkin 
npm install    @opentelemetry/instrumentation 
npm install    @opentelemetry/instrumentation-winston 
npm install    @opentelemetry/resources 
npm install    @opentelemetry/sdk-node 
npm install    @opentelemetry/semantic-conventions 


1 - Initalize Docker Container for Zipkin:
    docker run --rm  -d -p 9411:9411 openzipkin/zipki


