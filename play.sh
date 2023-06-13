#!/bin/bash


# Check if both arguments are provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 <round> <hands>"
  exit 1
fi

# Assign the arguments to variables
round=$1
hands=$2


node play $round $hands > /dev/null
node evaluate.js $round