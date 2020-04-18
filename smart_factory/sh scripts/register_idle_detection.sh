curl -iX POST \
          'http://192.168.1.137:8070/ngsi10/updateContext' \
        -H 'Content-Type: application/json' \
        -d "@register_idle_detection.json" \
        --trace-ascii register_idle_detection_log.txt
