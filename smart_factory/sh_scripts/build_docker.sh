#!/bin/bash
for file in $(find ../docker_images -regex ".*/build.*sh$")
do
  printf '\n\n'
  echo '---------------'
  echo "$file"
  echo '---------------'
  printf '\n\n'
  sh "$file"
done
wait