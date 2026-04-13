/**
 * Dashboard RP : code d'accès + événements applicatifs + suivi réservations par événement.
 */
(function () {
  var TRACKED_KEY = 'ns_rp_tracked_event_ids';
  var FIRSTNAME_KEY = 'ns_rp_dashboard_firstname';

  function eventNameToSlug(name) {
    if (!name || typeof name !== 'string') return '';
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/(\d)[^a-z0-9]+(?=\d)/g, '$1')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /** Même convention que reservation.js : #id/slug[/table|tickets]/prenom-slug */
  function buildReservationHashPath(eventId, eventName, promoterPlain) {
    var slug = eventNameToSlug(eventName || '');
    var parts = [String(eventId)];
    if (slug) parts.push(slug);
    if (promoterPlain && String(promoterPlain).trim()) {
      parts.push(eventNameToSlug(String(promoterPlain).trim()));
    }
    return '/reservation#' + parts.join('/');
  }

  function buildAbsoluteShareLink(firstname, eventId, eventName) {
    var origin = '';
    try {
      origin = window.location.origin || '';
    } catch (e) {}
    if (!origin && typeof location !== 'undefined') {
      origin = location.protocol + '//' + location.host;
    }
    return origin + buildReservationHashPath(eventId, eventName, firstname);
  }

  function loadFirstname() {
    try {
      return localStorage.getItem(FIRSTNAME_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function saveFirstname(v) {
    try {
      localStorage.setItem(FIRSTNAME_KEY, v);
    } catch (e) {}
  }

  function refreshAllShareLinks() {
    var fnEl = document.getElementById('rp-dash-firstname');
    var fn = fnEl ? fnEl.value.trim() : '';
    document.querySelectorAll('.rp-dash-ev[data-rp-ev-id]').forEach(function (article) {
      var id = article.getAttribute('data-rp-ev-id');
      var name = article.getAttribute('data-rp-ev-name') || '';
      var url = buildAbsoluteShareLink(fn, id, name);
      var inp = article.querySelector('.rp-dash-share-url');
      var open = article.querySelector('.rp-dash-share-open');
      var hint = article.querySelector('.rp-dash-share-hint');
      if (inp) inp.value = url;
      if (open) open.href = url;
      if (hint) hint.hidden = !!fn;
    });
  }

  var state = {
    allEvents: [],
    trackedIds: new Set(),
    dashboardStarted: false,
    /** 'upcoming' = catalogue filtré par recherche ; 'selected' = uniquement les soirées cochées */
    eventsFilter: 'upcoming'
  };

  function parseEvDate(str) {
    if (!str) return null;
    var d = new Date(str);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  function endOfLocalDay(d) {
    var x = new Date(d.getTime());
    x.setHours(23, 59, 59, 999);
    return x;
  }

  function eventEffectiveEnd(ev) {
    var start = parseEvDate(ev.event_date || ev.event_start || ev.date);
    var end = parseEvDate(
      ev.event_endDate || ev.endDate || ev.end_date || ev.event_date_end
    );
    if (end) return end;
    if (start) return endOfLocalDay(start);
    return null;
  }

  function isEventCurrentOrUpcoming(ev) {
    var end = eventEffectiveEnd(ev);
    if (!end) return false;
    return end.getTime() >= Date.now();
  }

  function sortEventsByStart(a, b) {
    var ta = parseEvDate(a.event_date || a.event_start || a.date);
    var tb = parseEvDate(b.event_date || b.event_start || b.date);
    var na = ta ? ta.getTime() : Infinity;
    var nb = tb ? tb.getTime() : Infinity;
    return na - nb;
  }

  function pruneTrackedToCatalog() {
    var ids = new Set();
    state.allEvents.forEach(function (ev) {
      var id = String(ev.event_id || ev.id || '');
      if (id) ids.add(id);
    });
    var changed = false;
    Array.from(state.trackedIds).forEach(function (id) {
      if (!ids.has(id)) {
        state.trackedIds.delete(id);
        changed = true;
      }
    });
    if (changed) saveTrackedIds();
  }

  function eventMatchesSearch(ev, q) {
    if (!q) return true;
    var name = eventDisplayName(ev).toLowerCase();
    var city = eventCity(ev).toLowerCase();
    var id = String(ev.event_id || ev.id || '');
    return name.indexOf(q) !== -1 || city.indexOf(q) !== -1 || id.indexOf(q) !== -1;
  }

  /** Liste affichée selon le mode (à venir / sélectionnées) et la recherche. */
  function getDisplayedEvents(filterText) {
    var q = (filterText || '').trim().toLowerCase();
    var list = state.allEvents.filter(function (ev) {
      if (ev && ev.event_Dev === 1) return false;
      if (!eventMatchesSearch(ev, q)) return false;
      if (state.eventsFilter === 'selected') {
        var id = String(ev.event_id || ev.id || '');
        return id && state.trackedIds.has(id);
      }
      return true;
    });
    return list;
  }

  function visibleEventIds(filterText) {
    return getDisplayedEvents(filterText)
      .map(function (ev) {
        return String(ev.event_id || ev.id || '');
      })
      .filter(Boolean);
  }

  function eventTimingBadge(ev) {
    var now = Date.now();
    var start = parseEvDate(ev.event_date || ev.event_start || ev.date);
    var end = eventEffectiveEnd(ev);
    if (!start || !end) return '';
    if (start.getTime() > now) {
      return '<span class="rp-dash-mini-badge rp-dash-mini-badge--soon">À venir</span>';
    }
    if (end.getTime() >= now) {
      return '<span class="rp-dash-mini-badge rp-dash-mini-badge--live">En cours</span>';
    }
    return '';
  }

  function updateEventsCountChip() {
    var el = document.getElementById('rp-dash-events-count');
    var filterInput = document.getElementById('rp-dash-event-filter');
    if (!el) return;
    var ft = filterInput ? filterInput.value : '';
    el.textContent = String(getDisplayedEvents(ft).length);
  }

  function showApp() {
    var gate = document.getElementById('rp-dash-gate');
    var prot = document.getElementById('rp-dash-protected');
    if (gate) gate.hidden = true;
    if (prot) prot.hidden = false;
    if (!state.dashboardStarted) {
      state.dashboardStarted = true;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startDashboard);
      } else {
        startDashboard();
      }
    }
  }

  function loadTrackedIds() {
    try {
      var raw = localStorage.getItem(TRACKED_KEY);
      if (!raw) return new Set();
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return new Set();
      return new Set(arr.map(String));
    } catch (e) {
      return new Set();
    }
  }

  function saveTrackedIds() {
    try {
      localStorage.setItem(TRACKED_KEY, JSON.stringify(Array.from(state.trackedIds)));
    } catch (e) {}
  }

  function setStatus(msg, isError) {
    var el = document.getElementById('rp-dash-live-status');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('rp-dash-status-pill--error', !!isError);
    el.classList.toggle('rp-dash-status-pill--muted', !msg);
  }

  /**
   * POST tpromoteur / événement : enregistre quel promoteur a choisi quelle soirée.
   * 201 créé, 409 déjà lié — ignorés ; sinon message d’erreur.
   */
  function syncPromoterEventToApi(eventIdStr) {
    if (!window.NightSquarePromoter || typeof NightSquarePromoter.getPromotId !== 'function') {
      console.warn('[RP Dashboard] InsertEvent — ignoré (session promoteur absente)');
      return;
    }
    var pid = NightSquarePromoter.getPromotId();
    var eid = parseInt(String(eventIdStr), 10);
    if (!pid || isNaN(eid) || eid < 1) {
      console.warn('[RP Dashboard] InsertEvent — ignoré', { promot_id: pid, event_id: eventIdStr });
      return;
    }
    console.log('[RP Dashboard] InsertEvent — POST /api/tpromoteur/InsertEvent.php', {
      tpromotevent_promotid: pid,
      tpromotevent_eventid: eid
    });
    fetch('/api/tpromoteur/InsertEvent.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        tpromotevent_promotid: pid,
        tpromotevent_eventid: eid
      })
    })
      .then(function (r) {
        if (r.status === 201) {
          console.log('[RP Dashboard] InsertEvent — OK liaison créée (HTTP 201)', { event_id: eid });
          return null;
        }
        if (r.status === 409) {
          console.log('[RP Dashboard] InsertEvent — OK déjà enregistré (HTTP 409)', { event_id: eid });
          return null;
        }
        return r
          .json()
          .then(function (d) {
            return { status: r.status, data: d };
          })
          .catch(function () {
            return { status: r.status, data: null };
          });
      })
      .then(function (result) {
        if (!result) return;
        console.error('[RP Dashboard] InsertEvent — échec', {
          http: result.status,
          body: result.data
        });
        var msg =
          (result.data && result.data.message) ||
          (result.status === 503
            ? "Impossible d'enregistrer l'événement côté serveur."
            : 'Erreur liaison promoteur / événement.');
        setStatus(msg, true);
      })
      .catch(function (err) {
        console.error('[RP Dashboard] InsertEvent — erreur réseau', err);
        setStatus('Erreur réseau (liaison événement).', true);
      });
  }

  function parseEventsPayload(data) {
    if (!data) return [];
    if (data.tevents && Array.isArray(data.tevents)) return data.tevents;
    if (Array.isArray(data)) return data;
    var key = Object.keys(data).find(function (k) {
      return Array.isArray(data[k]);
    });
    return key ? data[key] : [];
  }

  function parseReservationsPayload(data) {
    if (!data) return [];
    var list =
      data.data ||
      data.reservations ||
      data.treserv ||
      data.treserv_events ||
      data.reserv_events ||
      (Array.isArray(data) ? data : []);
    return Array.isArray(list) ? list : [];
  }

  function formatStatus(s) {
    var n = parseInt(s, 10);
    if (n === 1) return { label: 'En attente d’acompte', kind: 'pending' };
    if (n === 2) return { label: 'Confirmée (acompte payé)', kind: 'ok' };
    if (n === 3) return { label: 'Refusée', kind: 'bad' };
    if (n === 4) return { label: 'Payée / confirmée', kind: 'ok' };
    if (n === 6) return { label: 'Confirmée (tickets)', kind: 'ok' };
    return { label: 'En attente', kind: 'pending' };
  }

  function fmtAmount(v) {
    var n = parseFloat(v);
    if (isNaN(n)) return '—';
    return n.toFixed(2).replace('.', ',') + ' €';
  }

  function reservEventName(r) {
    return (
      r.reserv_event_name ||
      r.event_name ||
      r.reserv_event_title ||
      r.event_title ||
      r.name ||
      '—'
    );
  }

  function reservDateStr(r) {
    return (
      r.reserv_event_date ||
      r.event_date ||
      r.reserv_date ||
      r.date ||
      r.event_date_end ||
      ''
    );
  }

  function reservId(r) {
    return r.reserv_id || r.id || '';
  }

  function reservTotal(r) {
    var t =
      r.priceTotSt ||
      r.reserv_total ||
      r.reserv_price ||
      r.Price ||
      r.reserv_amount;
    return t;
  }

  function reservTypLabel(r) {
    var typ = r.reserv_typ != null ? parseInt(r.reserv_typ, 10) : null;
    if (typ === 0) return 'Table';
    if (typ === 1) return 'Billets';
    return 'Réservation';
  }

  function formatDateLabel(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function pillClass(kind) {
    if (kind === 'ok') return 'rp-dash-pill rp-dash-pill--ok';
    if (kind === 'bad') return 'rp-dash-pill rp-dash-pill--bad';
    return 'rp-dash-pill rp-dash-pill--pending';
  }

  function eventDisplayName(ev) {
    return ev.event_name || ev.name || 'Sans titre';
  }

  function eventCity(ev) {
    return ev.event_lieux || ev.event_city || ev.city || '';
  }

  function eventDateLabel(ev) {
    var d = ev.event_date || ev.event_start || ev.date || '';
    if (!d) return '—';
    try {
      var dt = new Date(d);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    } catch (e) {}
    return d;
  }

  function renderEventsList(filterText) {
    var container = document.getElementById('rp-dash-events-list');
    if (!container) return;
    container.innerHTML = '';

    var list = getDisplayedEvents(filterText);

    if (list.length === 0) {
      if (state.allEvents.length === 0) {
        container.innerHTML =
          '<div class="rp-dash-empty rp-dash-empty--hero">' +
          '<p class="rp-dash-empty-title">Aucune soirée à suivre</p>' +
          '<p class="rp-dash-empty-text">Soit toutes les dates sont passées, soit l’API n’a pas renvoyé d’événement avec une date de fin exploitable.</p>' +
          '</div>';
      } else if (state.eventsFilter === 'selected' && state.trackedIds.size === 0) {
        container.innerHTML =
          '<div class="rp-dash-empty">' +
          '<p>Aucune soirée sélectionnée. Passe sur <strong>Soirées à venir</strong> pour cocher les soirées à suivre.</p>' +
          '</div>';
      } else {
        container.innerHTML =
          '<div class="rp-dash-empty"><p>Aucun résultat pour ta recherche.</p></div>';
      }
      updateEventsCountChip();
      return;
    }

    var fnEl = document.getElementById('rp-dash-firstname');
    var fn = fnEl ? fnEl.value.trim() : '';

    list.forEach(function (ev) {
      var id = String(ev.event_id || ev.id || '');
      if (!id) return;
      var ename = eventDisplayName(ev);
      var row = document.createElement('article');
      row.className = 'rp-dash-ev';
      row.setAttribute('data-rp-ev-id', id);
      row.setAttribute('data-rp-ev-name', ename);
      var checked = state.trackedIds.has(id);
      var url = buildAbsoluteShareLink(fn, id, ename);
      var cbId = 'rp-dash-cb-' + id.replace(/[^a-zA-Z0-9_-]/g, '_');

      row.innerHTML =
        '<div class="rp-dash-ev-row">' +
        '<div class="rp-dash-ev-check">' +
        '<input type="checkbox" class="rp-dash-event-cb" id="' +
        escapeAttr(cbId) +
        '" data-event-id="' +
        escapeAttr(id) +
        '" ' +
        (checked ? 'checked ' : '') +
        '>' +
        '<label for="' +
        escapeAttr(cbId) +
        '" class="rp-dash-ev-check-label"><span class="rp-dash-ev-check-box" aria-hidden="true"></span></label>' +
        '</div>' +
        '<div class="rp-dash-ev-main">' +
        '<div class="rp-dash-ev-titleline">' +
        '<span class="rp-dash-event-name">' +
        escapeHtml(ename) +
        '</span>' +
        eventTimingBadge(ev) +
        '</div>' +
        '<div class="rp-dash-event-meta">' +
        '<span>' +
        escapeHtml(eventDateLabel(ev)) +
        '</span>' +
        (eventCity(ev)
          ? '<span class="rp-dash-event-dot"> · </span><span>' + escapeHtml(eventCity(ev)) + '</span>'
          : '') +
        '</div></div></div>' +
        '<div class="rp-dash-ev-share"' +
        (checked ? '' : ' hidden') +
        '>' +
        '<p class="rp-dash-share-title">Lien à partager (réservation)</p>' +
        '<div class="rp-dash-share-row">' +
        '<input type="text" readonly class="rp-dash-share-url" value="' +
        escapeAttr(url) +
        '" aria-label="Lien de réservation">' +
        '<button type="button" class="rp-dash-share-copy" data-rp-copy>Copier</button>' +
        '<a class="rp-dash-share-open" href="' +
        escapeAttr(url) +
        '" target="_blank" rel="noopener noreferrer">Tester</a>' +
        '</div>' +
        '<p class="rp-dash-share-hint"' +
        (fn ? ' hidden' : '') +
        '>Ajoute ton prénom en haut : il sera ajouté <strong>à la fin du lien</strong> (après le nom de la soirée).</p>' +
        '</div>';

      container.appendChild(row);
    });

    container.querySelectorAll('.rp-dash-event-cb').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var eid = cb.getAttribute('data-event-id');
        if (!eid) return;
        if (cb.checked) {
          state.trackedIds.add(eid);
          syncPromoterEventToApi(eid);
        } else state.trackedIds.delete(eid);
        saveTrackedIds();
        var article = cb.closest('.rp-dash-ev');
        var share = article && article.querySelector('.rp-dash-ev-share');
        if (share) share.hidden = !cb.checked;
        updateMetrics();
        loadReservations();
        if (state.eventsFilter === 'selected') {
          var fi2 = document.getElementById('rp-dash-event-filter');
          renderEventsList(fi2 ? fi2.value : '');
        }
      });
    });

    refreshAllShareLinks();
    updateEventsCountChip();
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  function updateSelectedSummary() {
    var el = document.getElementById('rp-dash-selected-summary');
    if (!el) return;
    var n = state.trackedIds.size;
    if (n === 0) el.textContent = 'Aucune soirée sélectionnée';
    else if (n === 1) el.textContent = '1 soirée sélectionnée';
    else el.textContent = n + ' soirées sélectionnées';
  }

  function updateMetrics() {
    var tracked = state.trackedIds.size;
    var totalEv = state.allEvents.filter(function (ev) {
      return ev && ev.event_Dev !== 1;
    }).length;
    var elT = document.getElementById('rp-dash-m-tracked');
    var elR = document.getElementById('rp-dash-m-reserv');
    var elE = document.getElementById('rp-dash-m-total-events');
    if (elT) elT.textContent = String(tracked);
    if (elE) elE.textContent = String(totalEv);
    if (elR && !state._reservCountPending) elR.textContent = String(state._lastReservCount || 0);
    updateSelectedSummary();
  }

  async function fetchJson(url) {
    var res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  async function loadEvents() {
    var loading = document.getElementById('rp-dash-events-loading');
    var errEl = document.getElementById('rp-dash-events-error');
    if (loading) loading.hidden = false;
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    setStatus('Chargement des événements…');

    try {
      var data = await fetchJson('/api/events/selectall.php');
      var raw = parseEventsPayload(data);
      state.allEvents = raw
        .filter(function (ev) {
          return ev && ev.event_Dev !== 1;
        })
        .filter(isEventCurrentOrUpcoming)
        .sort(sortEventsByStart);
      pruneTrackedToCatalog();
      if (loading) loading.hidden = true;
      setStatus(
        state.allEvents.length
          ? state.allEvents.length + ' soirée(s) active(s) ou à venir.'
          : 'Aucune soirée active ou à venir dans le catalogue.'
      );
      var filterInput = document.getElementById('rp-dash-event-filter');
      renderEventsList(filterInput ? filterInput.value : '');
      updateMetrics();
      loadReservations();
    } catch (e) {
      if (loading) loading.hidden = true;
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          'Impossible de charger les événements. Vérifie la connexion ou réessaie plus tard.';
      }
      setStatus('Erreur chargement événements.', true);
      updateMetrics();
    }
  }

  async function loadReservations() {
    var tbody = document.getElementById('rp-dash-reserv-tbody');
    var hint = document.getElementById('rp-dash-reserv-hint');
    var loadEl = document.getElementById('rp-dash-reserv-loading');
    var elAmt = document.getElementById('rp-dash-m-amount');
    var elR = document.getElementById('rp-dash-m-reserv');

    if (!tbody) return;

    if (state.trackedIds.size === 0) {
      tbody.innerHTML = '';
      if (hint) hint.hidden = false;
      if (loadEl) loadEl.hidden = true;
      state._lastReservCount = 0;
      state._reservCountPending = false;
      if (elAmt) elAmt.textContent = '—';
      if (elR) elR.textContent = '0';
      return;
    }

    if (hint) hint.hidden = true;
    if (loadEl) loadEl.hidden = false;
    state._reservCountPending = true;
    setStatus('Chargement des réservations pour ' + state.trackedIds.size + ' événement(s)…');

    var allRows = [];
    var errors = 0;

    for (var id of state.trackedIds) {
      try {
        var data = await fetchJson(
          '/api/events/treserv-selectall.php?event_id=' + encodeURIComponent(id)
        );
        var list = parseReservationsPayload(data);
        list.forEach(function (r) {
          allRows.push({ eventId: id, r: r });
        });
      } catch (e) {
        errors++;
      }
    }

    if (loadEl) loadEl.hidden = true;
    state._reservCountPending = false;
    state._lastReservCount = allRows.length;
    if (elR) elR.textContent = String(allRows.length);

    var sum = 0;
    var hasSum = false;
    allRows.forEach(function (item) {
      var t = reservTotal(item.r);
      var n = parseFloat(t);
      if (!isNaN(n)) {
        sum += n;
        hasSum = true;
      }
    });
    if (elAmt) elAmt.textContent = hasSum ? fmtAmount(sum) : '—';

    allRows.sort(function (a, b) {
      var da = new Date(reservDateStr(a.r));
      var db = new Date(reservDateStr(b.r));
      var ta = isNaN(da.getTime()) ? 0 : da.getTime();
      var tb = isNaN(db.getTime()) ? 0 : db.getTime();
      return tb - ta;
    });

    tbody.innerHTML = '';
    if (allRows.length === 0 && state.trackedIds.size > 0) {
      var emptyTr = document.createElement('tr');
      emptyTr.innerHTML =
        '<td colspan="6" class="rp-dash-table-empty">Aucune réservation retournée pour les événements suivis.</td>';
      tbody.appendChild(emptyTr);
    } else {
      allRows.forEach(function (item) {
        var r = item.r;
        var st = formatStatus(r.reserv_status);
        var tr = document.createElement('tr');
        tr.className = 'rp-dash-data-row';
        tr.innerHTML =
          '<td class="rp-dash-mono">' +
          escapeHtml(String(reservId(r) || '—')) +
          '</td>' +
          '<td class="rp-dash-cell-strong">' +
          escapeHtml(reservEventName(r)) +
          '</td>' +
          '<td>' +
          escapeHtml(formatDateLabel(reservDateStr(r))) +
          '</td>' +
          '<td><span class="rp-dash-type-tag">' +
          escapeHtml(reservTypLabel(r)) +
          '</span></td>' +
          '<td class="rp-dash-col-num rp-dash-mono">' +
          escapeHtml(fmtAmount(reservTotal(r))) +
          '</td>' +
          '<td><span class="' +
          pillClass(st.kind) +
          '">' +
          escapeHtml(st.label) +
          '</span></td>';
        tbody.appendChild(tr);
      });
    }

    if (errors > 0) {
      setStatus(
        allRows.length
          ? 'Certaines réservations n’ont pas pu être chargées (API événement). Vérifie que le filtre event_id est supporté côté serveur.'
          : 'Aucune réservation retournée, ou l’API ne filtre pas par event_id.',
        allRows.length === 0
      );
    } else {
      setStatus(
        allRows.length +
          ' réservation(s) sur ' +
          state.trackedIds.size +
          ' événement(s) suivi(s).'
      );
    }
  }

  function initMobileTabs() {
    var ws = document.getElementById('rp-dash-workspace');
    var tabs = document.querySelectorAll('[data-rp-tab]');
    if (!ws || !tabs.length) return;
    function setView(name) {
      ws.setAttribute('data-rp-view', name);
      tabs.forEach(function (btn) {
        var on = btn.getAttribute('data-rp-tab') === name;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setView(btn.getAttribute('data-rp-tab') || 'events');
      });
    });
    setView('events');
  }

  function bindShareCopyDelegation() {
    var list = document.getElementById('rp-dash-events-list');
    if (!list || list._rpCopyBound) return;
    list._rpCopyBound = true;
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-rp-copy]');
      if (!btn || !list.contains(btn)) return;
      var wrap = btn.closest('.rp-dash-ev-share');
      var inp = wrap && wrap.querySelector('.rp-dash-share-url');
      if (!inp || !inp.value) return;
      var label = btn.textContent;
      function done() {
        btn.textContent = 'Copié !';
        setTimeout(function () {
          btn.textContent = label;
        }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inp.value).then(done).catch(function () {
          inp.select();
          try {
            document.execCommand('copy');
            done();
          } catch (err) {}
        });
      } else {
        inp.select();
        try {
          document.execCommand('copy');
          done();
        } catch (err) {}
      }
    });
  }

  function startDashboard() {
    state.trackedIds = loadTrackedIds();

    var fnInput = document.getElementById('rp-dash-firstname');
    if (fnInput) {
      var prenom = '';
      if (window.NightSquarePromoter && typeof NightSquarePromoter.getPrenom === 'function') {
        prenom = NightSquarePromoter.getPrenom() || '';
      }
      if (!prenom) prenom = loadFirstname();
      fnInput.value = prenom;
      fnInput.addEventListener('input', function () {
        saveFirstname(fnInput.value);
        if (window.NightSquarePromoter && NightSquarePromoter.setSession) {
          NightSquarePromoter.setSession({ promot_prenom: fnInput.value.trim() });
        }
        refreshAllShareLinks();
      });
      fnInput.addEventListener('change', function () {
        saveFirstname(fnInput.value);
        if (window.NightSquarePromoter && NightSquarePromoter.setSession) {
          NightSquarePromoter.setSession({ promot_prenom: fnInput.value.trim() });
        }
        refreshAllShareLinks();
      });
    }

    var logoutBtn = document.getElementById('rp-dash-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        if (window.NightSquarePromoter && NightSquarePromoter.clearSession) {
          NightSquarePromoter.clearSession();
        }
        window.location.href = '/rp-connexion';
      });
    }

    bindShareCopyDelegation();

    var refresh = document.getElementById('rp-dash-refresh');
    if (refresh) {
      refresh.addEventListener('click', function () {
        loadEvents();
      });
    }

    var filterInput = document.getElementById('rp-dash-event-filter');
    if (filterInput) {
      filterInput.addEventListener('input', function () {
        renderEventsList(filterInput.value);
      });
    }

    document.querySelectorAll('[data-rp-events-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-rp-events-filter');
        if (!mode || state.eventsFilter === mode) return;
        state.eventsFilter = mode;
        document.querySelectorAll('[data-rp-events-filter]').forEach(function (b) {
          var on = b.getAttribute('data-rp-events-filter') === mode;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        var fi = document.getElementById('rp-dash-event-filter');
        renderEventsList(fi ? fi.value : '');
      });
    });

    var selAll = document.getElementById('rp-dash-select-visible');
    if (selAll) {
      selAll.addEventListener('click', function () {
        var fi = document.getElementById('rp-dash-event-filter');
        visibleEventIds(fi ? fi.value : '').forEach(function (id) {
          state.trackedIds.add(id);
          syncPromoterEventToApi(id);
        });
        saveTrackedIds();
        renderEventsList(fi ? fi.value : '');
        updateMetrics();
        loadReservations();
      });
    }

    var clr = document.getElementById('rp-dash-clear-selection');
    if (clr) {
      clr.addEventListener('click', function () {
        state.trackedIds.clear();
        saveTrackedIds();
        var fi = document.getElementById('rp-dash-event-filter');
        renderEventsList(fi ? fi.value : '');
        updateMetrics();
        loadReservations();
      });
    }

    initMobileTabs();
    loadEvents();
  }

  function initGate() {
    showApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGate);
  } else {
    initGate();
  }
})();
