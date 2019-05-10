---
layout: page
permalink: /officers/
title: Officers
css: officers
---

<!-- Use _config.yml to change this page -->
{% for person in site.officers %}
<div class="officer">
	<h4>{{ person.job }}: {{ person.name }}</h4>
	<img src="/images/officers/{{ person.pic }}" />
	<p>{{ person.desc }}</p>
	<div></div>
</div>
{% endfor %}
