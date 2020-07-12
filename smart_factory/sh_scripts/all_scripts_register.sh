#!/bin/bash
IP=${1-192.168.43.155}
sh ./generic_register_operator_no_port.sh measure_robot_status_time "$IP"
sh ./generic_register_operator_no_port.sh detect_idle "$IP"
sh ./generic_register_operator_no_port.sh bracelets "$IP"
wait
sh ./generic_register_function.sh measure_robot_status_time Robot "$IP"
sh ./generic_register_function.sh detect_idle Result "$IP"
sh ./generic_register_function.sh bracelets Bracelet "$IP"
wait