#!/bin/bash

function usage() {
  echo "Command options are:"
  echo "[-a ip address of fogflow component. Default is localhost]"
  echo "[-s enables silent output]"
}

IP=localhost
while getopts i:a:t:s option; do #parse input options
  case "${option}" in
  a) IP=${OPTARG} ;;
  s) SILENT=true ;;
  \?) exit 1;;
  *)
    echo "invalid option: ${option}->${OPTARG}. "
    usage
    ;;
  esac
done

curl -iX POST "http://$IP:8070/ngsi10/updateContext" \
  ${SILENT:+'-o /dev/null'} \
  ${SILENT:+'-s'} \
        -H 'Content-Type: application/json' \
        -d @topology.json
RETURN=$?
if [ "$RETURN" -eq 0 ];
then
  echo "registered function $IMAGE"
else
  1>&2 echo "failed to register function $IMAGE"
fi
exit $RETURN