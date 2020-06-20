#!/bin/bash
PORT=4041
for file in $(find . -regex ".*/register.*sh$")
do
  echo $PORT
  sh "$file" "$PORT" &
  PORT=$((PORT+1))
done
wait