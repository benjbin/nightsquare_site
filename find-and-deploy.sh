#!/bin/bash

# Script pour trouver le répertoire web réel et déployer

CONFIG_FILE="sftp-config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Fichier $CONFIG_FILE introuvable !"
    exit 1
fi

HOST=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.host.replace(/^sftp:\\/\\//, ''))")
PORT=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.port || 22)")
USERNAME=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.username)")
PASSWORD=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.password || '')")

echo "🔍 Recherche du répertoire web réel..."
echo ""

# Chemins possibles à tester
PATHS=(
    "/"
    "/home/$USERNAME/public_html"
    "/home/$USERNAME/www"
    "/home/$USERNAME/htdocs"
    "/var/www/html"
    "/var/www/nightsquare.org"
    "/domains/nightsquare.org/public_html"
    "/www/nightsquare.org"
)

FOUND_PATH=""

for path in "${PATHS[@]}"; do
    EXPECT_SCRIPT=$(mktemp)
    cat > "$EXPECT_SCRIPT" << EOF
set timeout 10
spawn sftp -P $PORT -o StrictHostKeyChecking=no $USERNAME@$HOST
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "sftp>" {
        send "get $path/index.html /tmp/test-index-$RANDOM.html\r"
        expect {
            "sftp>" { }
            "No such file" { exit 1 }
            timeout { exit 1 }
        }
        send "quit\r"
        expect eof
    }
    timeout { exit 1 }
}
EOF
    
    if expect "$EXPECT_SCRIPT" > /dev/null 2>&1; then
        TEST_FILE=$(ls -t /tmp/test-index-*.html 2>/dev/null | head -1)
        if [ -f "$TEST_FILE" ]; then
            # Vérifier si ce fichier correspond au site web
            if grep -q "nav-search" "$TEST_FILE" 2>/dev/null; then
                echo "✅ TROUVÉ: $path (contient nav-search - c'est l'ancienne version servie par le web)"
                FOUND_PATH="$path"
                rm -f "$TEST_FILE"
                break
            fi
        fi
        rm -f "$TEST_FILE"
    fi
    rm -f "$EXPECT_SCRIPT"
done

if [ -z "$FOUND_PATH" ]; then
    echo "⚠️  Répertoire web non trouvé automatiquement, utilisation de la racine /"
    FOUND_PATH="/"
fi

echo ""
echo "📁 Répertoire web trouvé: $FOUND_PATH"
echo "🚀 Déploiement dans ce répertoire..."
echo ""

# Mettre à jour la config
node -e "const c=require('./$CONFIG_FILE'); c.remotePath='$FOUND_PATH'; require('fs').writeFileSync('./$CONFIG_FILE', JSON.stringify(c, null, 2));"

# Déployer
./deploy-sftp.sh

echo ""
echo "✅ Déploiement terminé !"
echo "🔄 Attendez 10-30 secondes pour que le cache se vide, puis testez:"
echo "   curl -s https://nightsquare.org/index.html | grep -c 'nav-search'"
echo "   (devrait retourner 0 si c'est corrigé)"
