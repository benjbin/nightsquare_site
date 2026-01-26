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

  // --- Connexion / Inscription avec Apple et Google (fonctionnels) ---
  // Config : dans login.html et inscription.html, définir avant auth.js :
  //   window.NIGHT_SQUARE_GOOGLE_CLIENT_ID = 'xxx.apps.googleusercontent.com';
  //   window.NIGHT_SQUARE_APPLE_REDIRECT_URL = 'https://api.../auth/apple';
  // Optionnel : window.NIGHT_SQUARE_GOOGLE_LOGIN_URL = 'https://api.../tusers/GoogleLogin.php' pour envoyer le token au backend

  function handleGoogleAuth() {
    var clientId = window.NIGHT_SQUARE_GOOGLE_CLIENT_ID;
    if (!clientId || !clientId.trim()) {
      alert(typeof currentLang !== 'undefined' && currentLang === 'en'
        ? 'Google Sign-In is not configured. Add NIGHT_SQUARE_GOOGLE_CLIENT_ID.'
        : 'Connexion Google non configurée. Ajoutez NIGHT_SQUARE_GOOGLE_CLIENT_ID.');
      return;
    }
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      alert(typeof currentLang !== 'undefined' && currentLang === 'en'
        ? 'Google Sign-In script is loading. Please try again in a moment.'
        : 'Chargement du script Google en cours. Réessayez dans un instant.');
      return;
    }
    var tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId.trim(),
      scope: 'email profile openid',
      callback: function(response) {
        if (!response || !response.access_token) return;
        var loginUrl = window.NIGHT_SQUARE_GOOGLE_LOGIN_URL;
        if (loginUrl && loginUrl.trim()) {
          var form = document.createElement('form');
          form.method = 'POST';
          form.action = loginUrl.trim();
          form.style.display = 'none';
          var input = document.createElement('input');
          input.name = 'access_token';
          input.value = response.access_token;
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
          return;
        }
        try { sessionStorage.setItem('ns_google_token', response.access_token); } catch (e) {}
        window.location.href = 'index.html';
      }
    });
    tokenClient.requestAccessToken();
  }

  function handleAppleAuth() {
    var url = window.NIGHT_SQUARE_APPLE_REDIRECT_URL;
    if (url && url.trim()) {
      window.location.href = url.trim();
    } else {
      alert(typeof currentLang !== 'undefined' && currentLang === 'en'
        ? 'Sign in with Apple is not configured. Add NIGHT_SQUARE_APPLE_REDIRECT_URL (your backend URL that redirects to Apple).'
        : 'Connexion Apple non configurée. Ajoutez NIGHT_SQUARE_APPLE_REDIRECT_URL (URL de votre backend qui redirige vers Apple).');
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

  // Retour OAuth Google en redirect (si utilisé avec response_type=token)
  (function checkGoogleReturn() {
    var hash = window.location.hash;
    if (!hash || hash.indexOf('access_token=') === -1) return;
    var params = {};
    hash.slice(1).split('&').forEach(function(p) {
      var kv = p.split('=');
      if (kv[0] && kv[1]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
    });
    if (params.access_token) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      var loginUrl = window.NIGHT_SQUARE_GOOGLE_LOGIN_URL;
      if (loginUrl && loginUrl.trim()) {
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = loginUrl.trim();
        form.style.display = 'none';
        var input = document.createElement('input');
        input.name = 'access_token';
        input.value = params.access_token;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        return;
      }
      try { sessionStorage.setItem('ns_google_token', params.access_token); } catch (e) {}
      window.location.href = 'index.html';
    }
  })();
})();
