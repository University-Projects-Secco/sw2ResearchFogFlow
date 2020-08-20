#!/bin/bash
IP=${1-localhost}
curl -iX POST "http://$IP:8070/ngsi10/updateContext" \
      -o /dev/null -s\
        -H 'Content-Type: application/json' \
        -d @topology.json
if [ $? -eq 0 ]; then
  echo "registered service topology"
else
  1>&2 echo "failed to service topology"
fi