#!/bin/bash

# Script pour vérifier directement le contenu des fichiers sur le serveur

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

echo "🔍 Vérification directe du contenu sur le serveur..."
echo "📡 Serveur: $HOST:$PORT"
echo "👤 Utilisateur: $USERNAME"
echo ""

# Créer le script expect pour télécharger et afficher
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
        send "get /index.html /tmp/index-server-verify.html\r"
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
    echo "✅ Connexion réussie et fichier téléchargé"
    echo ""
    echo "📄 Contenu du header dans index.html sur le serveur:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sed -n '/<header>/,/<\/header>/p' /tmp/index-server-verify.html | head -30
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    echo "🔍 Recherche de 'search' ou 'nav-search' dans le header:"
    if grep -i "search\|nav-search" /tmp/index-server-verify.html | grep -v "SearchAction" | head -5; then
        echo ""
        echo "❌ PROBLÈME TROUVÉ: Il y a encore des références à 'search' dans le fichier!"
    else
        echo "✅ Aucune référence à 'search' trouvée (sauf SearchAction qui est normal)"
    fi
    
    echo ""
    echo "🔍 Recherche spécifique de 'nav-search' ou 'event-search-input':"
    if grep -n "nav-search\|event-search-input" /tmp/index-server-verify.html; then
        echo "❌ PROBLÈME: Ces éléments sont toujours présents!"
    else
        echo "✅ Aucun élément nav-search ou event-search-input trouvé"
    fi
    
    echo ""
    echo "📋 Comparaison ligne par ligne du header (local vs serveur):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "LOCAL (lignes 256-280):"
    sed -n '256,280p' index.html
    echo ""
    echo "SERVEUR (lignes équivalentes):"
    sed -n '256,280p' /tmp/index-server-verify.html
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Nettoyer
    rm -f /tmp/index-server-verify.html
else
    echo "❌ Erreur lors de la connexion au serveur"
    echo "Vérifiez les informations dans sftp-config.json"
fi

rm -f "$EXPECT_SCRIPT"
