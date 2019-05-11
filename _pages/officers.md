---
layout: page
permalink: /officers/
title: Officers
menu: Officers
css: officers
---

<h2>{{ site.year }}</h2>

<!-- Use _config.yml to change this page -->
{% for person in site.officers %}
<div class="officer">
	<h4>{{ person.job }}: {{ person.name }}</h4>
	<img src="/images/officers/{{ person.pic }}" />
	<p>{{ person.bio }}</p>
	<div></div>
</div>
{% endfor %}
