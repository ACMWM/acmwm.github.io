---
layout: page
title: Design Thinking Workshop
permalink: /ideathon
css: external
---

For the design thinking ideathon, try to come up with a solution to this problem. It can be an app, a physical object, or anything you can conceptualize! Be creative!

We need to design a solution for <strong id="problem">(problems)</strong> for a user who is troubled by <strong id="pain">(pain)</strong> and wants <strong id="gain">(gain)</strong>.

<button id="reload">Reload</button>

<script defer>
    (async function() {
        const data = await fetch('/data/design-thinking.json').then(x => x.json());
        function reload () {
            const problem = data.problems[Math.floor(Math.random() * data.problems.length)];
            const pain = data.pains[Math.floor(Math.random() * data.pains.length)];
            const gain = data.gains[Math.floor(Math.random() * data.gains.length)];

            document.querySelector("#problem").innerText = problem.toLowerCase();
            document.querySelector("#pain").innerText = pain.toLowerCase();
            document.querySelector("#gain").innerText = gain.toLowerCase();
        };
        document.querySelector("#reload").onclick = reload;
        reload();
    })();
</script>