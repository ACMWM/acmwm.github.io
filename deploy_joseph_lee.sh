#!/bin/sh
DEPLOY="/home/acm"

# Preferably separate commits but this ensures changes are pushed
git commit -a
git pull
git push

jekyll build --trace
rsync -rcvz --delete --exclude='.git*' --exclude='.zfs' _site/ "joegen@th121-21.cs.wm.edu:$DEPLOY/"
