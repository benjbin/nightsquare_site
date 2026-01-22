#!/bin/bash

# Script de déploiement SFTP pour Night Square
# Téléverse les fichiers modifiés sur le serveur SFTP

CONFIG_FILE="sftp-config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Fichier $CONFIG_FILE introuvable !"
    exit 1
fi

# Extraire les informations de configuration avec Node.js pour un parsing JSON correct
HOST=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.host.replace(/^sftp:\\/\\//, ''))")
PORT=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.port || 22)")
USERNAME=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.username)")
PASSWORD=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.password || '')")
REMOTE_PATH=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.remotePath || '/')")

if [ -z "$HOST" ] || [ -z "$USERNAME" ]; then
    echo "❌ Host et username requis dans $CONFIG_FILE !"
    exit 1
fi

PORT=${PORT:-22}
REMOTE_PATH=${REMOTE_PATH:-/}

echo "🚀 Déploiement sur le serveur SFTP..."
echo "📡 Serveur: $HOST:$PORT"
echo "👤 Utilisateur: $USERNAME"
echo "📁 Chemin distant: $REMOTE_PATH"
echo ""

# Fichiers à déployer (ajoutez d'autres fichiers si nécessaire)
FILES=(
    "index.html"
    "css/style.css"
    "js/main.js"
    "js/translations.js"
    "download.html"
    "events.html"
    "how-it-works.html"
    "organizers.html"
    "js/download.js"
    "js/events.js"
    "js/how-it-works.js"
    "js/organizers.js"
    "robots.txt"
    "sitemap.xml"
    "vercel.json"
)

# Créer le script expect
EXPECT_SCRIPT=$(mktemp)
cat > "$EXPECT_SCRIPT" << EOF
set timeout 30
spawn sftp -P $PORT -o StrictHostKeyChecking=no $USERNAME@$HOST
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "sftp>" {
        # Upload des fichiers
EOF

# Créer les dossiers nécessaires d'abord (ignorer les erreurs si existent déjà)
if [ -n "$REMOTE_PATH" ] && [ "${REMOTE_PATH: -1}" != "/" ]; then
    CSS_DIR="$REMOTE_PATH/css"
    JS_DIR="$REMOTE_PATH/js"
else
    CSS_DIR="${REMOTE_PATH}css"
    JS_DIR="${REMOTE_PATH}js"
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
expect "$EXPECT_SCRIPT"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Déploiement réussi !"
else
    echo ""
    echo "❌ Erreur lors du déploiement"
    rm -f "$EXPECT_SCRIPT"
    exit 1
fi

rm -f "$EXPECT_SCRIPT"
