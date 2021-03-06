#!/bin/bash
IP=${1-192.168.1.131}
IMAGES=(measure_robot_status_time_js detect_idle_js bracelets_js counter_js)
TYPES=(Robot Result Bracelet Error)
SILENT=false
LINE_SEPARATOR='---------------------'
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
  if [ "$SILENT" == false ]; then echo "fogflow ip: $IP"; fi
}

function register_all_operators() {
  if [ "$SILENT" == false ]; then
    echo "$LINE_SEPARATOR"
    echo "registering operators"
    echo "$LINE_SEPARATOR"
  fi
  for (( i = 0; i < ${#IMAGES[@]}; i++ )); do
      if ./generic_register_operator.sh -i "${IMAGES[i]}" -a "$IP" -o galaxarum "$(if [ "$SILENT" == true ]; then echo "-s";fi )"
      then continue
      else return 1
    fi
  done
}

function register_all_functions() {
  if [ "$SILENT" == false ]; then
    echo "$LINE_SEPARATOR"
    echo "registering functions"
    echo "$LINE_SEPARATOR"
  fi
  for (( i = 0; i < ${#IMAGES[@]}; i++ )); do
      if ./generic_register_function.sh -i "${IMAGES[i]}" -t "${TYPES[i]}" -a "$IP" "$(if [ "$SILENT" == true ]; then echo "-s";fi )"
      then continue
      else return 1
    fi
  done
}

function register_topology() {
  if [ "$SILENT" == false ]; then
    echo "$LINE_SEPARATOR"
    echo "registering topology"
    echo "$LINE_SEPARATOR"
  fi
  ./register_topology.sh -a "$IP" "$(if [ "$SILENT" == true ]; then echo "-s";fi )"
  return $?
}

getIp
if register_all_operators
then
  if [ "$SILENT" == false ]
  then
    echo "$LINE_SEPARATOR"
    echo 'all operators registered'
    echo "$LINE_SEPARATOR";
  fi
elif [ "$SILENT" == false ]
then
  echo "$LINE_SEPARATOR"
  echo 'error registering operators'
  echo "$LINE_SEPARATOR"
  exit 1
fi

if register_all_functions
then
  if [ "$SILENT" == false ]
  then
    echo "$LINE_SEPARATOR"
    echo 'all functions registered'
    echo "$LINE_SEPARATOR"
  fi
elif [ "$SILENT" == false ]
then
  echo "$LINE_SEPARATOR"
  echo 'error registering functions'
  echo "$LINE_SEPARATOR"
  exit 1
fi

if register_topology
then
 if [ "$SILENT" == false ]
 then
  echo "$LINE_SEPARATOR"
   echo 'topology registered'
  echo "$LINE_SEPARATOR"
 fi
elif [ "$SILENT" == false ]
then
  echo "$LINE_SEPARATOR"
  echo 'error registering topology'
  echo "$LINE_SEPARATOR"
  exit 1
fi