---
layout: page
permalink: /officers/
title: Officers
---

<!-- Use _config.yml to change this page -->
{% for person in site.officers %}
<div class="officer">
	<h4>{{ person.name }}, {{ person.job }}</h4>
	<img src="/images/officers/{{ person.pic }}" />
	<p>{{ person.desc }}</p>
</div>
{% endfor %}
