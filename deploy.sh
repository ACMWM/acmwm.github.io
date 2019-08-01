#!/bin/sh
DEPLOY="acmsite"

# Preferably separate commits but this ensures changes are pushed
git commit -a
git pull
git push

jekyll build
rsync -rcvz --delete _site/ "bg3.cs.wm.edu:$DEPLOY/"
