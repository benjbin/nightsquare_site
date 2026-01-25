/**
 * Night Square - Auth pages (login / inscription)
 * Validation côté client et préparation pour un futur backend (ex. Supabase Auth)
 */
(function() {
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
      // TODO: appeler l’API d’auth (ex. Supabase signUp) puis redirection
      // window.location.href = 'index.html';
      return false;
    });
  }
})();
