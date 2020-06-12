#!/bin/bash
for file in $(find ../docker_images -regex ".*/build.*sh$")
do
  echo '---------------'
  echo "$file"
  echo '---------------'
  sh "$file"
done
wait