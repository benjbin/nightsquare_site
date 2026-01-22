#!/bin/bash

# Script pour vérifier le contenu des fichiers sur le serveur SFTP

CONFIG_FILE="sftp-config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Fichier $CONFIG_FILE introuvable !"
    exit 1
fi

# Extraire les informations de configuration
HOST=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.host.replace(/^sftp:\\/\\//, ''))")
PORT=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.port || 22)")
USERNAME=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.username)")
PASSWORD=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.password || '')")
REMOTE_PATH=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.remotePath || '/')")

echo "🔍 Vérification des fichiers sur le serveur..."
echo "📡 Serveur: $HOST:$PORT"
echo ""

# Créer le script expect pour vérifier
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
        send "get /index.html /tmp/index-server.html\r"
        expect "sftp>"
        send "get /css/style.css /tmp/style-server.css\r"
        expect "sftp>"
        send "get /js/main.js /tmp/main-server.js\r"
        expect "sftp>"
        send "quit\r"
        expect eof
    }
    timeout {
        puts "Timeout"
        exit 1
    }
}
EOF

expect "$EXPECT_SCRIPT" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Fichiers téléchargés du serveur"
    echo ""
    echo "📄 Vérification index.html:"
    if grep -q "nav-search\|event-search-input\|search-input" /tmp/index-server.html 2>/dev/null; then
        echo "❌ PROBLÈME: Le champ de recherche est toujours présent dans index.html sur le serveur!"
        grep -n "nav-search\|event-search-input\|search-input" /tmp/index-server.html | head -3
    else
        echo "✅ Pas de champ de recherche trouvé dans index.html"
    fi
    
    echo ""
    echo "📄 Vérification style.css:"
    if grep -q "\.nav-search\|\.search-input\|\.search-button" /tmp/style-server.css 2>/dev/null; then
        echo "❌ PROBLÈME: Les styles de recherche sont toujours présents dans style.css sur le serveur!"
        grep -n "\.nav-search\|\.search-input\|\.search-button" /tmp/style-server.css | head -3
    else
        echo "✅ Pas de styles de recherche trouvés dans style.css"
    fi
    
    echo ""
    echo "📄 Vérification main.js:"
    if grep -q "event-search-input\|searchInput\|currentSearchQuery" /tmp/main-server.js 2>/dev/null; then
        echo "❌ PROBLÈME: Le code de recherche est toujours présent dans main.js sur le serveur!"
        grep -n "event-search-input\|searchInput\|currentSearchQuery" /tmp/main-server.js | head -3
    else
        echo "✅ Pas de code de recherche trouvé dans main.js"
    fi
    
    # Comparaison avec les fichiers locaux
    echo ""
    echo "🔄 Comparaison avec les fichiers locaux:"
    if diff -q index.html /tmp/index-server.html > /dev/null 2>&1; then
        echo "✅ index.html: Identique"
    else
        echo "⚠️  index.html: Différent (vérifiez les différences)"
    fi
    
    if diff -q css/style.css /tmp/style-server.css > /dev/null 2>&1; then
        echo "✅ style.css: Identique"
    else
        echo "⚠️  style.css: Différent (vérifiez les différences)"
    fi
    
    if diff -q js/main.js /tmp/main-server.js > /dev/null 2>&1; then
        echo "✅ main.js: Identique"
    else
        echo "⚠️  main.js: Différent (vérifiez les différences)"
    fi
    
    # Nettoyer
    rm -f /tmp/index-server.html /tmp/style-server.css /tmp/main-server.js
else
    echo "❌ Erreur lors de la connexion au serveur"
fi

rm -f "$EXPECT_SCRIPT"
