#!/bin/bash
for file in $(find . -regex ".*/register.*sh$")
do
  sh "$file" &
done
wait