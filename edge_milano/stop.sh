docker stop metricbeat && docker rm $_
docker stop edgebroker && docker rm $_
docker stop edgeworker && docker rm $_
yes | docker container prune
