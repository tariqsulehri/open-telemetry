Since you have a professional-grade stack with named volumes, you need a command that cleans up not just the containers, but also the persistent storage volumes and any "dangling" data.
⚠️ Warning

These commands are destructive. Once executed, your logs (Loki), metrics (Prometheus), and traces (Jaeger) will be permanently deleted from your local drive.
🚀 Option 1: The "Clean Slate" Command (Recommended)

This is the standard way to stop your stack and wipe the volumes defined in your docker-compose.yml.
Bash

docker compose down -v --remove-orphans

    -v (or --volumes): This is the key flag. It removes the named volumes (loki-data, prometheus-data, etc.) that were created by the compose file.

    --remove-orphans: Cleans up any containers that were part of the project but are no longer in the YAML file.

🧹 Option 2: The "Deep Clean" (Nuclear Option)

If you want to recover maximum space (including old images, build caches, and volumes from previous failed tests), run this after Option 1:
Bash

docker system prune -a --volumes

    -a: Removes all unused images (not just dangling ones).

    --volumes: Ensures all unused volumes across your entire Docker engine are wiped.

📂 Option 3: Manual Folder Cleanup

Since your Loki configuration previously used a bind mount (./loki-data), Docker might not be able to delete that folder automatically because it is managed by your host OS, not Docker.

To remove that specifically (on Mac/Linux):
Bash

rm -rf ./loki-data ./prometheus-data

(On Windows PowerShell):
PowerShell

Remove-Item -Recurse -Force ./loki-data, ./prometheus-data

📊 Summary Checklist for Reclaiming Space

    Stop everything: docker compose down -v
    Prune System: docker system prune -f

    Check Usage: Run docker system df to see how much space you actually reclaimed.



OPTION # 2
-----------

💻 One-Liner (Copy & Paste)

If you don't want a script and just want to run it quickly in your terminal:

For Mac/Linux:
Bash

docker compose down -v --remove-orphans && rm -rf ./loki-data ./prometheus-data && docker system prune -f

For Windows (PowerShell):
PowerShell

docker compose down -v --remove-orphans; Remove-Item -Recurse -Force ./loki-data, ./prometheus-data; docker system prune -f

🛡️ Why these specific commands?

    docker compose down -v: This targets the Named Volumes (jaeger-data, otel-data, grafana-data). These are managed by Docker and hidden in your system files.

    rm -rf ./loki-data: This targets Bind Mounts. Since these are folders you can see in your project directory, Docker sometimes leaves them behind for safety. We remove them manually to be sure.

    docker system prune: This recovers space from "Layer Caches." Every time you change your OTel config or Dockerfile, Docker keeps the old version. This command deletes those old versions.

📊 How to check your space

Before and after running the commands, you can run this to see the results:
Bash

docker system df

It will show you exactly how many GBs were reclaimed from Images, Containers, and Local Volumes.