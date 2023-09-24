# acmwm.github.io

The official website of the William & Mary Chapter of the Association for Computing Machinery

This site is built with [Jekyll](https://jekyllrb.com/docs/) and the [Minima Theme](https://github.com/jekyll/minima)

## How to install Jekyll for Windows

1. [Install Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install)

Note: WSL Ubuntu comes installed already with `Git`, `rsync`, and `ssh` so no need to worry about installing those. 

2. [Follow these instructions](https://www.vgemba.net/blog/Setup-Jekyll-WSL/) to install `jekyll`. You may ignore the "We can also list all installed Gems..." step. 

## How to deploy

There are GitHub Actions workflows configured to deploy our website to GitHub pages and the CS department servers so our members can access it at `acm.cs.wm.edu`. New webmasters will have to upload an SSH private key to the repository so that the workflow will work using their account. Our implementation is based around [this blog post](https://zellwk.com/blog/github-actions-deploy/) if you want more information.

1. [SSH into the department machine](https://support.cs.wm.edu/index.php/tips-and-tricks/how-to-ssh-into-a-cs-machine) and navigate to the `~/.ssh` directory.
1. Run `groups`. If you don't see `acm` listed, submit a support ticket.
1. Create an SSH public key using `ssh-keygen -t rsa -b 4096 -C "YOUR_USERNAME@acm-github-action"`, replacing the username with your CS department username. Save the key as `acm-github-action` when prompted and do not add a passphrase.
1. Add the public key to your authorized keys by running `cat acm-github-action.pub >> ~/.ssh/authorized_keys`. This will allow the action to log in as you and upload the files to the `/home/acm` directory **ONLY** if it can access the private key.
1. Add the private key to GitHub. Type `cat acm-github-action` to view the private key and copy the entire contents to the clipboard. [Then, navigate to the secrets page for our repo](https://github.com/ACMWM/acmwm.github.io/settings/secrets/actions). Edit the `SSH_PRIVATE_KEY` secret and copy your private key as the value. Then, select the variables tab at the top next to secrets. Add your CS account username as the `SSH_USERNAME` variable.
1. The deploy script is now ready and the site will be published to `acm.cs.wm.edu` when the master branch is updated.

The reason we use an SSH key is to avoid needing to connect to the department machine, enter your password, and copy the files manually. SSH keys are also revocable-- you can remove the `username@acm-github-action` public key line from `~/.ssh/authorized_keys` at any time and the action will no longer be able to log in as you and copy the files.

## Layout

Each page begins with specific [Front Matter](https://jekyllrb.com/docs/front-matter/), followed by [Markdown](https://guides.github.com/features/mastering-markdown/).
Each page is built using a specific [layout](https://jekyllrb.com/docs/layouts/) from the `_layouts` folder.
Each layout usually includes some headers and footers from `_includes`

Our default layout is fairly standard, but has an extra `css` attribute which allows a page to specify extra css to be included
from the `css` folder.

## Officers

Officer information is stored in `_config.yml`, which is documented [here](https://jekyllrb.com/docs/configuration/).
This file is YAML, which is a key value format. 
For multi-line strings, you'll want a `>` and then a newline at the end.
Each officer has a job, name, pic, and bio. The pic should be stored in the `images/officers` folder and be a square 
(Our CSS currently resizes them to 140 x 140).

## Membership
You'll need to get a list of current members from the Treasurer. Then just paste it in and make sure each line has one member and
begins with `* `. I recommend a regular expression, though the format will depend on your editor of choice.

## Cypher and SWC
These pages are just links to external resources for the most part. They follow a specific format defined by `css/external.css`.

The cypher website's code is [here](https://github.com/ACMWM/cypher).

## Events
This page contains an embedded copy of [this Google calendar](https://calendar.google.com/calendar?cid=ZW1haWwud20uZWR1X2ExcjJtMDRnN2tlbTFvYWh2aHRnMWpjanFvQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20). 
Be sure to put information about ACM meetings there so it's actually useful.

## Hardware

This should link to the hardware checkout system once its been deployed on department hardware.

## Redirect from wm.acm.org
We currently redirect `wm.acm.org` to our website at `acm.cs.wm.edu` via a `.htaccess` file:
```
Redirect 301 / http://acm.cs.wm.edu
```
