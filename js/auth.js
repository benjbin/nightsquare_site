/**
 * Night Square - Auth pages (login / inscription)
 * Inscription : POST https://api.nightsquarepro.com/tusers/Insert.php
 * Si l’API attend d’autres noms de paramètres, modifier API_SIGNUP_PARAMS ci‑dessous.
 */
(function() {
  // Noms des paramètres attendus par tusers/Insert.php (aucune doc publique)
  // Essai 1 : préfixe user_ (cohérent avec tevents/ event_*)
  var API_SIGNUP_PARAMS = { name: 'user_name', email: 'user_email', password: 'user_password' };
  // Essai 2 si l’API attend sans préfixe : { name: 'name', email: 'email', password: 'password' }
  function getTranslation(key) {
    try {
      var keys = key.split('.');
      var obj = typeof translations !== 'undefined' && translations[currentLang] ? translations[currentLang] : (translations && translations.fr) ? translations.fr : {};
      for (var i = 0; i < keys.length; i++) {
        obj = obj[keys[i]];
        if (obj == null) return key;
      }
      return typeof obj === 'string' ? obj : key;
    } catch (e) {
      return key;
    }
  }

  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var emailEl = document.getElementById('login-email');
      var passwordEl = document.getElementById('login-password');
      var emailError = document.getElementById('login-email-error');
      var passwordError = document.getElementById('login-password-error');
      if (emailError) emailError.textContent = '';
      if (passwordError) passwordError.textContent = '';
      var valid = true;
      if (!emailEl.value.trim()) {
        if (emailError) emailError.textContent = getTranslation('auth.errors.emailRequired') || 'Email requis';
        valid = false;
      }
      if (!passwordEl.value) {
        if (passwordError) passwordError.textContent = getTranslation('auth.errors.passwordRequired') || 'Mot de passe requis';
        valid = false;
      }
      if (!valid) return;
      // TODO: appeler l’API d’auth (ex. Supabase signIn) puis redirection
      // window.location.href = 'index.html';
      return false;
    });
  }

  var signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var nameEl = document.getElementById('signup-name');
      var emailEl = document.getElementById('signup-email');
      var passwordEl = document.getElementById('signup-password');
      var confirmEl = document.getElementById('signup-password-confirm');
      var emailError = document.getElementById('signup-email-error');
      var passwordError = document.getElementById('signup-password-error');
      var confirmError = document.getElementById('signup-password-confirm-error');
      if (emailError) emailError.textContent = '';
      if (passwordError) passwordError.textContent = '';
      if (confirmError) confirmError.textContent = '';
      var valid = true;
      if (!emailEl.value.trim()) {
        if (emailError) emailError.textContent = getTranslation('auth.errors.emailRequired') || 'Email requis';
        valid = false;
      }
      if (!passwordEl.value) {
        if (passwordError) passwordError.textContent = getTranslation('auth.errors.passwordRequired') || 'Mot de passe requis';
        valid = false;
      } else if (passwordEl.value.length < 8) {
        if (passwordError) passwordError.textContent = getTranslation('auth.errors.passwordMin') || '8 caractères minimum';
        valid = false;
      }
      if (passwordEl.value !== confirmEl.value) {
        if (confirmError) confirmError.textContent = getTranslation('auth.errors.passwordMatch') || 'Les mots de passe ne correspondent pas';
        valid = false;
      }
      if (!valid) return;

      var submitBtn = signupForm.querySelector('.auth-submit');
      var submitText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = (typeof currentLang !== 'undefined' && currentLang === 'en') ? 'Creating account…' : 'Création du compte…';
      }
      if (emailError) emailError.textContent = '';
      if (passwordError) passwordError.textContent = '';
      if (confirmError) confirmError.textContent = '';

      var apiUrl = 'https://api.nightsquarepro.com/tusers/Insert.php';
      var body = new URLSearchParams();
      body.append(API_SIGNUP_PARAMS.name, (nameEl.value || '').trim());
      body.append(API_SIGNUP_PARAMS.email, emailEl.value.trim());
      body.append(API_SIGNUP_PARAMS.password, passwordEl.value);

      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      })
        .then(function(res) { return res.text().then(function(text) { return { ok: res.ok, status: res.status, text: text }; }); })
        .then(function(result) {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitText; }
          var data = null;
          try { data = result.text ? JSON.parse(result.text) : null; } catch (e) {}
          if (result.ok) {
            if (data && (data.redirect || data.url)) {
              window.location.href = data.redirect || data.url;
            } else {
              window.location.href = 'login.html';
            }
            return;
          }
          var msg = (data && (data.message || data.error || data.msg)) ? (data.message || data.error || data.msg) : (result.text || ('Erreur ' + result.status));
          if (emailError) emailError.textContent = msg;
        })
        .catch(function(err) {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitText; }
          var msg = (typeof currentLang !== 'undefined' && currentLang === 'en') ? 'Network error. Please try again.' : 'Erreur réseau. Veuillez réessayer.';
          if (emailError) emailError.textContent = msg;
        });
      return false;
    });
  }

  // --- Connexion / Inscription avec Apple et Google ---
  // Google : définir window.NIGHT_SQUARE_GOOGLE_CLIENT_ID (ex. xxx.apps.googleusercontent.com)
  // Apple  : définir window.NIGHT_SQUARE_APPLE_REDIRECT_URL (URL de ton backend qui redirige vers Apple)
  function handleGoogleAuth() {
    var clientId = window.NIGHT_SQUARE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      if (window.console) console.warn('Night Square: NIGHT_SQUARE_GOOGLE_CLIENT_ID non configuré.');
      return;
    }
    var redirectUri = window.location.origin + window.location.pathname;
    var scope = 'email profile openid';
    var url = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + encodeURIComponent(clientId) +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&response_type=token&scope=' + encodeURIComponent(scope) + '&nonce=' + Math.random();
    window.location.href = url;
  }

  function handleAppleAuth() {
    var url = window.NIGHT_SQUARE_APPLE_REDIRECT_URL;
    if (url) {
      window.location.href = url;
    } else {
      if (window.console) console.warn('Night Square: NIGHT_SQUARE_APPLE_REDIRECT_URL non configuré.');
    }
  }

  function bindSocialButtons() {
    var googleIds = ['login-google', 'signup-google'];
    var appleIds = ['login-apple', 'signup-apple'];
    googleIds.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', handleGoogleAuth);
    });
    appleIds.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', handleAppleAuth);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSocialButtons);
  } else {
    bindSocialButtons();
  }

  // Au retour OAuth Google (fragment #access_token=...) : envoyer le token au backend ou rediriger
  (function checkGoogleReturn() {
    var hash = window.location.hash;
    if (!hash || hash.indexOf('access_token=') === -1) return;
    var params = {};
    hash.slice(1).split('&').forEach(function(p) {
      var kv = p.split('=');
      if (kv[0] && kv[1]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
    });
    if (params.access_token) {
      // Nettoyer l’URL (enlève le fragment) et envoyer params.access_token à ton API si besoin
      history.replaceState(null, '', window.location.pathname + window.location.search);
      if (window.NIGHT_SQUARE_GOOGLE_CALLBACK && typeof window.NIGHT_SQUARE_GOOGLE_CALLBACK === 'function') {
        window.NIGHT_SQUARE_GOOGLE_CALLBACK(params);
      } else {
        window.location.href = 'index.html';
      }
    }
  })();
})();
