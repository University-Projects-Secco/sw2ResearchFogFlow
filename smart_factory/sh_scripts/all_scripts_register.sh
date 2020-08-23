#!/bin/bash
IP=${1-192.168.1.131}
IMAGES=(measure_robot_status_time detect_idle bracelets)
TYPES=(Robot Result Bracelet)
if [[ "${#IMAGES[@]}" != "${#TYPES[@]}" ]]; then echo "invalid configuration arrays"; exit 1; fi

while getopts s option  #parse input options
do
case "${option}" in
s) SILENT=true;;
*) echo "invalid option: ${option}->${OPTARG}. Command options are:"
  echo "[-s enables silent output]"
esac
done

function getIp() {
  read -ra IPS <<< "$(hostname -I)"
  for ip in "${IPS[@]}"; do
    if [[ $ip != 127* ]];
    then
      IP=$ip
      break
    fi
  done
}

function register_all_operators() {
  if [ "$SILENT" == false ]; then echo "registering operators"; fi
  for (( i = 0; i < ${#IMAGES[@]}; i++ )); do
      if ./generic_register_operator.sh -i "${IMAGES[i]}" -a "$IP" -o galaxarum ${SILENT:+-s}
      then continue
      else return 1
    fi
  done
}

function register_all_functions() {
  if [ "$SILENT" == false ]; then echo "registering functions"; fi
  for (( i = 0; i < ${#IMAGES[@]}; i++ )); do
      if ./generic_register_function.sh -i "${IMAGES[i]}" -t "${TYPES[i]}" -a "$IP" ${SILENT:+-s}
      then continue
      else return 1
    fi
  done
}

function register_topology() {
  return "$(curl -iX POST "http://$IP:8070/ngsi10/updateContext" \
            -o /dev/null -s\
            -H 'Content-Type: application/json' \
            -d @topology.json)"
}

getIp
if register_all_operators && [ "$SILENT" == false ]; then echo 'all operators registered'; elif [ "$SILENT" == true ]; then echo 'error registering operators'; exit 1; fi
if register_all_functions && [ "$SILENT" == false ]; then echo 'all functions registered'; elif [ "$SILENT" == true ]; then echo 'error registering functions'; exit 1; fi
if register_topology && [ "$SILENT" == false ]; then echo 'topology registered'; elif [ "$SILENT" == true ]; then echo 'error registering topology'; exit 1; fi