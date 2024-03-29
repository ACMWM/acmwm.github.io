#!/bin/sh
DEPLOY="/home/acm"

# Preferably separate commits but this ensures changes are pushed
git commit -a
git pull
git push

jekyll build --trace
rsync -rcvz --delete --exclude='.git*' --exclude='.zfs' _site/ "kelleythewang@bg13.cs.wm.edu:$DEPLOY/"
