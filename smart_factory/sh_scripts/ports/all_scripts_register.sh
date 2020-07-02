#!/bin/bash
IP=${1-'291.168.1.132'}
sh "./generic_register_operator.sh" "measure_robot_status_time $IP 4041" &
sh "./generic_register_operator.sh" "detect_idle $IP 4042" &
sh "./generic_register_operator.sh" "bracelets $IP 4043" &
wait