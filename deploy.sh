#!/bin/sh
DEPLOY="public_html/acm"
jekyll build
rsync -rcvz --delete _site/ "bg3.cs.wm.edu:$DEPLOY/"
