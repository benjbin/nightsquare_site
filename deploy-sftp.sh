#!/bin/bash
# Script de déploiement SFTP pour Night Square — déploie tout le site
# Utilise le mot de passe dans sftp-config.json (expect, pas besoin de brew/sshpass)
# 1. Optionnel : cache-busting si Node dispo 2. Upload de tous les fichiers

set +H
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/sftp-config.json"
cd "$SCRIPT_DIR" || exit 1

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Fichier $CONFIG_FILE introuvable !"
    exit 1
fi

# Extraire la configuration : Node.js si disponible, sinon sed
if command -v node &>/dev/null; then
    HOST=$(node -e "const c=require('$CONFIG_FILE'); console.log((c.host||'').replace(/^sftp:\\/\\//, ''))")
    PORT=$(node -e "const c=require('$CONFIG_FILE'); console.log(c.port || 22)")
    USERNAME=$(node -e "const c=require('$CONFIG_FILE'); console.log(c.username || '')")
    PASSWORD=$(node -e "const c=require('$CONFIG_FILE'); console.log(c.password || '')")
    REMOTE_PATH=$(node -e "const c=require('$CONFIG_FILE'); console.log(c.remotePath || '/')")
else
    RAW=$(cat "$CONFIG_FILE")
    HOST=$(echo "$RAW" | sed -n 's|.*"host"[[:space:]]*:[[:space:]]*"sftp://\([^"]*\)".*|\1|p')
    [ -z "$HOST" ] && HOST=$(echo "$RAW" | sed -n 's|.*"host"[[:space:]]*:[[:space:]]*"\([^"]*\)".*|\1|p')
    HOST=${HOST#sftp://}
    PORT=$(echo "$RAW" | sed -n 's|.*"port"[[:space:]]*:[[:space:]]*\([0-9]*\).*|\1|p')
    USERNAME=$(echo "$RAW" | sed -n 's|.*"username"[[:space:]]*:[[:space:]]*"\([^"]*\)".*|\1|p')
    PASSWORD=$(echo "$RAW" | sed -n 's|.*"password"[[:space:]]*:[[:space:]]*"\([^"]*\)".*|\1|p')
    REMOTE_PATH=$(echo "$RAW" | sed -n 's|.*"remotePath"[[:space:]]*:[[:space:]]*"\([^"]*\)".*|\1|p')
fi

if [ -z "$HOST" ] || [ -z "$USERNAME" ]; then
    echo "❌ Host et username requis dans $CONFIG_FILE !"
    exit 1
fi
if [ -z "$PASSWORD" ]; then
    echo "❌ Mot de passe requis dans $CONFIG_FILE (clé \"password\")."
    exit 1
fi

PORT=${PORT:-22}
REMOTE_PATH=${REMOTE_PATH:-/}

# 0. Régénérer le sitemap avec les événements actuels (ils changent en permanence)
if command -v node &>/dev/null && [ -f "generate-sitemap.js" ]; then
    echo "🗺️  Régénération du sitemap (événements à jour)..."
    node generate-sitemap.js 2>/dev/null || echo "   (API indisponible, sitemap conservé)"
    echo ""
fi

# 1. Injecter le cache-busting dans les HTML (sera restauré à la fin) si Node est disponible
DID_INJECT=
if command -v node &>/dev/null; then
    echo "📦 Injection du cache-busting (CSS/JS)..."
    cd "$SCRIPT_DIR" && node scripts/inject-version.js && DID_INJECT=1 || { echo "❌ Erreur inject-version.js"; exit 1; }
    trap 'cd "$SCRIPT_DIR" && node scripts/inject-version.js --restore 2>/dev/null || true' EXIT
else
    echo "📦 (Node absent : cache-busting ignoré, déploiement direct)"
fi

# Pré-tests (fichiers + deploy config)
echo "🧪 Vérification pré-déploiement..."
[ -f "api/tmusics/SelectAll.php" ] || { echo "❌ api/tmusics/SelectAll.php manquant"; exit 1; }
grep -q "api/tmusics/SelectAll.php" deploy-sftp.sh || { echo "❌ api/tmusics absent du deploy"; exit 1; }
echo "   ✅ Fichiers et config OK"
echo ""

echo "🚀 Déploiement sur le serveur SFTP..."
echo "📡 Serveur: $HOST:$PORT"
echo "👤 Utilisateur: $USERNAME"
echo "📁 Chemin distant: $REMOTE_PATH"
echo ""

# Fichiers à déployer (ajoutez d'autres fichiers si nécessaire)
FILES=(
    "favicon.php"
    "index.html"
    "css/style.css"
    "css/liquid-glass.css"
    "css/backoffice.css"
    "css/rp.css"
    "css/rp-dashboard-standalone.css"
    "js/main.js"
    "js/mobile-tabbar.js"
    "js/session.js"
    "js/cookie-consent.js"
    "js/layout.js"
    "js/home.js"
    "js/seo-i18n.js"
    "js/faq-schema.js"
    "js/translations.js"
    "download.html"
    "event.html"
    "events.html"
    "search.html"
    "djs.html"
    "privacy.html"
    "cookies.html"
    "legal.html"
    "reservation.html"
    "aide.html"
    "404.html"
    "supprime-mon-compte.html"
    "how-it-works.html"
    "organizers.html"
    "rp-promoteur.html"
    "rp-dashboard.html"
    "rp-auth.html"
    "promoter-auth.html"
    "js/promoter-session.js"
    "js/promoter-auth.js"
    "js/rp-session.js"
    "js/rp-auth.js"
    "login.html"
    "inscription.html"
    "profile.html"
    "edit-profile.html"
    "js/auth-config.js"
    "js/country-codes.js"
    "js/auth.js"
    "js/profile.js"
    "js/download.js"
    "js/event.js"
    "js/events.js"
    "js/recent-events.js"
    "js/search-card-layout.js"
    "js/search-page.js"
    "js/reservation.js"
    "js/how-it-works.js"
    "js/organizers.js"
    "js/rp.js"
    "js/rp-dashboard.js"
    "robots.txt"
    "sitemap.xml"
    "sitemap-index.xml"
    "sitemap-events.xml"
    ".htaccess"
    "logo-og.png"
    ".htaccess"
    "src/img/hero-1.png"
    "src/img/hero-2.png"
    "src/img/hero-3.png"
    "src/img/hero-4.png"
    "src/img/hero-5.png"
    "src/img/hero-6.png"
    "src/img/10.png"
    "src/img/logo.png"
    "src/img/logo-og.png"
    "src/img/martenlou.png"
    "src/img/rampa.webp"
    "src/img/organizers-step-create-event.png"
    "src/img/organizers-step-open-reservations.png"
    "src/img/organizers-step-live-manager.png"
    "src/IMG_9247.PNG"
    "src/IMG_9248.PNG"
    "src/IMG_9249.PNG"
    "video/nsorga.MP4"
    "api/.htaccess"
    "api/_lib/ns-security.php"
    "api/_lib/ns-api-bootstrap.php"
    "api/config/.htaccess"
    "api/config/secrets.example.php"
    "api/config/secrets.php"
    "api/spotify/artist-track.php"
    "api/events/selectall.php"
    "api/events/selectone.php"
    "api/events/tal-selectall.php"
    "api/events/ttable-selectall.php"
    "api/events/ttkevent-selectall.php"
    "api/events/reserv-insert.php"
    "api/events/treserv-selectall.php"
    "api/events/treserv-selectone.php"
    "api/events/treserv-update.php"
    "api/stripe/.htaccess"
    "api/stripe/_table_deposit_lib.php"
    "api/stripe/create-table-deposit-intent.php"
    "api/stripe/confirm-table-deposit.php"
    "api/stripe/stripe-config.example.php"
    "api/stripe/stripe-config.php"
    "api/events/tusers-verifexist.php"
    "api/events/tusers-verifpassnq.php"
    "api/events/tusers-insert.php"
    "api/events/tusers-update.php"
    "api/events/tusers-selectone.php"
    "api/image/proxy.php"
    "api/video/serve.php"
    "api/tusers/GoogleLogin.php"
    "api/tusers/AppleLogin.php"
    "api/tusers/VerifExist.php"
    "api/tusers/VerifPassNq.php"
    "api/tusers/Insert.php"
    "api/tusers/verifexist.php"
    "api/tusers/verifpassnq.php"
    "api/tusers/insert.php"
    "api/tusers/apple-config.example.php"
    "api/tusers/apple-config.php"
    "api/tmusics/SelectAll.php"
    "api/tpromoteur/Insert.php"
    "api/tpromoter/Insert.php"
    "api/tpromoteur/VerifPass.php"
    "api/tpromoteur/Update.php"
    "api/tpromoteur/Delete.php"
    "api/tpromoteur/DeleteEvent.php"
    "api/tpromoteur/InsertEvent.php"
    "api/tpromoteur/selectAllEventPromot.php"
    "api/tpromoteur/SelectOne.php"
)

# Méthode 1 : sshpass (plus fiable, pas de prompt) si disponible
if [ -n "$PASSWORD" ] && command -v sshpass &>/dev/null; then
    BATCH_FILE=$(mktemp)
    for file in "${FILES[@]}"; do
        [ -f "$file" ] || continue
        if [ "${REMOTE_PATH: -1}" != "/" ] && [ -n "$REMOTE_PATH" ]; then
            echo "put $file $REMOTE_PATH/$file" >> "$BATCH_FILE"
        else
            echo "put $file $REMOTE_PATH$file" >> "$BATCH_FILE"
        fi
    done
    echo "quit" >> "$BATCH_FILE"
    echo "📤 Upload avec sshpass..."
    if (cd "$SCRIPT_DIR" && SSHPASS="$PASSWORD" sshpass -e sftp -P "$PORT" -o StrictHostKeyChecking=no -b "$BATCH_FILE" "$USERNAME@$HOST"); then
        rm -f "$BATCH_FILE"
        echo ""
        echo "✅ Déploiement réussi !"
        exit 0
    fi
    rm -f "$BATCH_FILE"
    echo "⚠️  sshpass a échoué, tentative avec expect..."
fi

# Créer le script expect (mot de passe via fichier pour caractères spéciaux type !)
EXPECT_SCRIPT=$(mktemp)
PASS_FILE=$(mktemp)
printf '%s' "$PASSWORD" > "$PASS_FILE"
chmod 600 "$PASS_FILE"

cat > "$EXPECT_SCRIPT" << EXPECTHEAD
set timeout 600
set f [open "PASS_FILE_PLACEHOLDER" r]
gets \$f pass
close \$f
spawn sftp -P PORT_PLACEHOLDER -o StrictHostKeyChecking=no USERNAME_PLACEHOLDER@HOST_PLACEHOLDER
expect {
    -re "assword:" {
        send "\$pass\r"
        exp_continue
    }
    "sftp>" {
        # Upload des fichiers
EXPECTHEAD
sed -i '' "s|PASS_FILE_PLACEHOLDER|$PASS_FILE|g" "$EXPECT_SCRIPT" 2>/dev/null || sed -i "s|PASS_FILE_PLACEHOLDER|$PASS_FILE|g" "$EXPECT_SCRIPT"
sed -i '' "s/PORT_PLACEHOLDER/$PORT/" "$EXPECT_SCRIPT" 2>/dev/null || sed -i "s/PORT_PLACEHOLDER/$PORT/" "$EXPECT_SCRIPT"
sed -i '' "s/USERNAME_PLACEHOLDER/$USERNAME/" "$EXPECT_SCRIPT" 2>/dev/null || sed -i "s/USERNAME_PLACEHOLDER/$USERNAME/" "$EXPECT_SCRIPT"
sed -i '' "s/HOST_PLACEHOLDER/$HOST/" "$EXPECT_SCRIPT" 2>/dev/null || sed -i "s/HOST_PLACEHOLDER/$HOST/" "$EXPECT_SCRIPT"

# Créer les dossiers nécessaires d'abord (ignorer les erreurs si existent déjà)
if [ -n "$REMOTE_PATH" ] && [ "${REMOTE_PATH: -1}" != "/" ]; then
    CSS_DIR="$REMOTE_PATH/css"
    JS_DIR="$REMOTE_PATH/js"
    SRC_DIR="$REMOTE_PATH/src"
    SRC_IMG_DIR="$REMOTE_PATH/src/img"
    VIDEO_DIR="$REMOTE_PATH/video"
    API_DIR="$REMOTE_PATH/api"
    API_SPOTIFY_DIR="$REMOTE_PATH/api/spotify"
    API_EVENTS_DIR="$REMOTE_PATH/api/events"
    API_STRIPE_DIR="$REMOTE_PATH/api/stripe"
    API_LIB_DIR="$REMOTE_PATH/api/_lib"
    API_CONFIG_DIR="$REMOTE_PATH/api/config"
    API_VIDEO_DIR="$REMOTE_PATH/api/video"
    API_IMAGE_DIR="$REMOTE_PATH/api/image"
    API_TUSERS_DIR="$REMOTE_PATH/api/tusers"
    API_TMUSICS_DIR="$REMOTE_PATH/api/tmusics"
    API_TPROMOTEUR_DIR="$REMOTE_PATH/api/tpromoteur"
    API_TPROMOTER_DIR="$REMOTE_PATH/api/tpromoter"
else
    CSS_DIR="${REMOTE_PATH}css"
    JS_DIR="${REMOTE_PATH}js"
    SRC_DIR="${REMOTE_PATH}src"
    SRC_IMG_DIR="${REMOTE_PATH}src/img"
    VIDEO_DIR="${REMOTE_PATH}video"
    API_DIR="${REMOTE_PATH}api"
    API_SPOTIFY_DIR="${REMOTE_PATH}api/spotify"
    API_EVENTS_DIR="${REMOTE_PATH}api/events"
    API_STRIPE_DIR="${REMOTE_PATH}api/stripe"
    API_LIB_DIR="${REMOTE_PATH}api/_lib"
    API_CONFIG_DIR="${REMOTE_PATH}api/config"
    API_VIDEO_DIR="${REMOTE_PATH}api/video"
    API_IMAGE_DIR="${REMOTE_PATH}api/image"
    API_TUSERS_DIR="${REMOTE_PATH}api/tusers"
    API_TMUSICS_DIR="${REMOTE_PATH}api/tmusics"
    API_TPROMOTEUR_DIR="${REMOTE_PATH}api/tpromoteur"
    API_TPROMOTER_DIR="${REMOTE_PATH}api/tpromoter"
fi

echo "        send \"mkdir $CSS_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $JS_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $SRC_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $SRC_IMG_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_SPOTIFY_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_EVENTS_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_STRIPE_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_LIB_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_CONFIG_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $VIDEO_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_VIDEO_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_IMAGE_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_TUSERS_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_TMUSICS_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_TPROMOTEUR_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"
echo "        send \"mkdir $API_TPROMOTER_DIR\r\"" >> "$EXPECT_SCRIPT"
echo "        expect {" >> "$EXPECT_SCRIPT"
echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
echo "        }" >> "$EXPECT_SCRIPT"

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        # Ajouter un slash si remotePath ne se termine pas par un slash
        if [ "${REMOTE_PATH: -1}" != "/" ] && [ -n "$REMOTE_PATH" ]; then
            REMOTE_FILE="$REMOTE_PATH/$file"
        else
            REMOTE_FILE="$REMOTE_PATH$file"
        fi
        echo "        send \"put $file $REMOTE_FILE\r\"" >> "$EXPECT_SCRIPT"
        echo "        expect \"sftp>\"" >> "$EXPECT_SCRIPT"
    fi
done

# Pages événement SEO statiques (events/*.html)
if [ -d "events" ] && [ "$(ls -A events/*.html 2>/dev/null | wc -l | tr -d ' ')" -gt 0 ]; then
    if [ "${REMOTE_PATH: -1}" != "/" ] && [ -n "$REMOTE_PATH" ]; then
        EVENTS_SEO_REMOTE="${REMOTE_PATH}/events"
    else
        EVENTS_SEO_REMOTE="${REMOTE_PATH}events"
    fi
    echo "        send \"mkdir $EVENTS_SEO_REMOTE\r\"" >> "$EXPECT_SCRIPT"
    echo "        expect {" >> "$EXPECT_SCRIPT"
    echo "            \"sftp>\" { }" >> "$EXPECT_SCRIPT"
    echo "            \"File exists\" { }" >> "$EXPECT_SCRIPT"
    echo "            \"Cannot create\" { }" >> "$EXPECT_SCRIPT"
    echo "        }" >> "$EXPECT_SCRIPT"
    echo "        send \"put -r events $EVENTS_SEO_REMOTE\r\"" >> "$EXPECT_SCRIPT"
    echo "        expect \"sftp>\"" >> "$EXPECT_SCRIPT"
fi

cat >> "$EXPECT_SCRIPT" << EOF
        send "quit\r"
        expect eof
    }
    timeout {
        puts "Timeout"
        exit 1
    }
}
EOF

# Vérifier si expect est installé
if ! command -v expect &> /dev/null; then
    echo "❌ 'expect' n'est pas installé."
    echo "   Installation: brew install expect (macOS) ou apt-get install expect (Linux)"
    rm -f "$EXPECT_SCRIPT"
    exit 1
fi

# Exécuter le script expect
echo "📤 Upload des fichiers..."
EXPECT_OUTPUT="$(expect "$EXPECT_SCRIPT" 2>&1)"
EXPECT_STATUS=$?
printf "%s\n" "$EXPECT_OUTPUT"

# FAIL FAST : certains hôtes ferment la connexion ("Connection closed")
# tout en laissant expect sortir avec 0, ce qui créait des faux positifs.
# Note: ne pas tester "Failure" seul — les "remote mkdir …: Failure" sont normaux si les dossiers existent déjà.
if [ $EXPECT_STATUS -ne 0 ] || [[ "$EXPECT_OUTPUT" == *"Connection reset"* ]] || [[ "$EXPECT_OUTPUT" == *"Couldn't"* ]] || [[ "$EXPECT_OUTPUT" == *"Permission denied"* ]] || echo "$EXPECT_OUTPUT" | grep -qE 'remote open ".*": Failure|Couldn'\''t (open|stat|read) local'; then
    rm -f "$EXPECT_SCRIPT" "$PASS_FILE"
    echo ""
    echo "❌ Erreur lors du déploiement (connexion/permissions SFTP)."
    exit 1
fi

rm -f "$EXPECT_SCRIPT" "$PASS_FILE"
echo ""
echo "✅ Déploiement réussi !"
exit 0
