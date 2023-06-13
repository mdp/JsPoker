#!/bin/bash

# Check if both arguments are provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 <round> <count>"
  exit 1
fi

# Assign the arguments to variables
round=$1
count=$2

echo "Simulating round $round with $count nodes"

for (( i=1; i<=$count; i++ ))
do
  echo "Starting node $i"
  node play $round > res.txt 
  res=`node append-results.js $round`
done

echo $res