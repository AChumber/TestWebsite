/* Enquiry form */
(function () {
	var form = document.getElementById('enquiry-form');
	if (!form) return;
	var res = document.getElementById('f-result'),
		err = document.getElementById('f-error');
	var prev = document.getElementById('f-preview'),
		mail = document.getElementById('f-mailto'),
		hint = document.getElementById('f-hint');
	var TO = 'office@futuresmattereducation.co.uk';
	function val(id) {
		return (document.getElementById(id).value || '').trim();
	}
	form.addEventListener('submit', function (e) {
		e.preventDefault();
		var missing = [];
		if (!val('f-name')) missing.push('your name');
		if (!val('f-role')) missing.push('who you are');
		if (!/^\S+@\S+\.\S+$/.test(val('f-email'))) missing.push('a valid email address');
		if (!val('f-topic')) missing.push('what your enquiry is about');
		if (!val('f-msg')) missing.push('your message');
		if (!document.getElementById('f-consent').checked)
			missing.push('your agreement to be contacted');
		if (missing.length) {
			err.textContent = 'Please add ' + missing.join(', ') + '.';
			err.hidden = false;
			return;
		}
		err.hidden = true;
		var lines = [
			'Enquiry about: ' + val('f-topic'),
			'From: ' + val('f-name') + ' (' + val('f-role') + ')',
			'Email: ' + val('f-email'),
		];
		if (val('f-phone')) lines.push('Telephone: ' + val('f-phone'));
		if (val('f-age')) lines.push('Age or year group: ' + val('f-age'));
		lines.push('', 'Message:', val('f-msg'));
		var text = lines.join('\n'),
			subject = 'Website enquiry: ' + val('f-topic');
		prev.value = text;
		mail.href =
			'mailto:' +
			TO +
			'?subject=' +
			encodeURIComponent(subject) +
			'&body=' +
			encodeURIComponent(text);
		hint.textContent = '';
		form.hidden = true;
		res.hidden = false;
		res.scrollIntoView({ block: 'nearest' });
	});
	document.getElementById('f-edit').addEventListener('click', function () {
		res.hidden = true;
		form.hidden = false;
	});
	document.getElementById('f-copy').addEventListener('click', function () {
		function fallback() {
			prev.focus();
			prev.select();
			hint.textContent = 'Text selected. Press Ctrl+C (or Cmd+C) to copy it.';
		}
		try {
			navigator.clipboard.writeText(prev.value).then(function () {
				hint.textContent = 'Copied. Paste it into an email to ' + TO + '.';
			}, fallback);
		} catch (x) {
			fallback();
		}
	});
	mail.addEventListener('click', function () {
		hint.textContent =
			'If your email app did not open, use Copy enquiry and email it to ' + TO + '.';
	});
})();

/* News list */
(function () {
	var FALLBACK = [
		{
			date: '2026-10-12',
			title: 'Our prospectus and policies are now online',
			text: 'You can now read or save our 2026 prospectus and browse our school policies on this website. If you would like a paper copy of anything, please ask the school office.',
			link: '#policies',
			linkText: 'See our policies',
		},
		{
			date: '2026-09-01',
			title: 'Visits and referrals',
			text: 'If you would like to visit Futures Matter Northwood or talk about a referral, please contact the school office on 0121 574 5455.',
			link: '#contact',
			linkText: 'Contact the school office',
		},
		{
			date: '2026-05-13',
			title: 'Pre-registration inspection report published',
			text: 'Following an inspection on 13 May 2026, Ofsted found that the school is likely to meet all the independent school standards if it is registered.',
			link: 'resources/policies/ofsted-pre-registration-report-13-may-2026.pdf',
			linkText: 'Read the report (PDF)',
		},
	];
	var list = document.getElementById('news-list'),
		more = document.getElementById('news-more');
	if (!list) return;
	var items = [],
		shown = 0,
		STEP = 3;
	function fmt(d) {
		try {
			return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			});
		} catch (e) {
			return d;
		}
	}
	function card(n) {
		var a = document.createElement('article');
		a.className = 'news-item';
		var t = document.createElement('time');
		t.setAttribute('datetime', n.date);
		t.textContent = fmt(n.date);
		a.appendChild(t);
		var h = document.createElement('h3');
		h.textContent = n.title;
		a.appendChild(h);
		var p = document.createElement('p');
		p.textContent = n.text;
		a.appendChild(p);
		if (n.link) {
			var l = document.createElement('a');
			l.href = n.link;
			l.textContent = n.linkText || 'Read more';
			if (/^policies\/|^prospectus\/|^https?:/.test(n.link)) {
				l.target = '_blank';
				l.rel = 'noopener';
			}
			a.appendChild(l);
		}
		return a;
	}
	function render() {
		var next = items.slice(shown, shown + STEP);
		next.forEach(function (n) {
			list.appendChild(card(n));
		});
		shown += next.length;
		more.hidden = shown >= items.length;
	}
	function start(data) {
		items = (Array.isArray(data) ? data : [])
			.filter(function (n) {
				return n && n.title && n.date;
			})
			.sort(function (a, b) {
				return a.date < b.date ? 1 : -1;
			});
		list.textContent = '';
		shown = 0;
		render();
	}
	more.addEventListener('click', render);
	start(FALLBACK);
	try {
		fetch('news.json', { cache: 'no-cache' })
			.then(function (r) {
				return r.ok ? r.json() : null;
			})
			.then(function (d) {
				if (d) start(d);
			})
			.catch(function () {});
	} catch (e) {}
})();

/* Safeguarding copy button */
(function () {
	var b = document.getElementById('sg-copy'),
		h = document.getElementById('sg-hint');
	if (!b) return;
	var addr = 'safeguarding@futuresmattereducation.co.uk';
	function note(t) {
		h.textContent = t;
	}
	b.addEventListener('click', function () {
		try {
			navigator.clipboard.writeText(addr).then(
				function () {
					note('Copied.');
				},
				function () {
					note('Please copy: ' + addr);
				},
			);
		} catch (e) {
			note('Please copy: ' + addr);
		}
	});
})();

/* Larger text toggle */
(function () {
	var b = document.getElementById('a11y-toggle');
	if (!b) return;
	b.addEventListener('click', function () {
		var on = document.documentElement.classList.toggle('big-text');
		b.setAttribute('aria-pressed', on ? 'true' : 'false');
		b.textContent = on ? 'Normal text' : 'Larger text';
	});
})();
