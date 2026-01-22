#!/bin/bash

# Script pour trouver le répertoire web réel

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
echo "📡 Serveur: $HOST:$PORT"
echo ""

# Chemins possibles à tester
PATHS=(
    "/"
    "/public_html"
    "/www"
    "/htdocs"
    "/domains/nightsquare.org/public_html"
    "/home/$USERNAME/public_html"
    "/home/$USERNAME/www"
    "/var/www/html"
)

EXPECT_SCRIPT=$(mktemp)
for path in "${PATHS[@]}"; do
    cat > "$EXPECT_SCRIPT" << EOF
set timeout 10
spawn sftp -P $PORT -o StrictHostKeyChecking=no $USERNAME@$HOST
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "sftp>" {
        send "ls $path\r"
        expect "sftp>"
        send "quit\r"
        expect eof
    }
    timeout {
        exit 1
    }
}
EOF
    
    echo "Test: $path"
    if expect "$EXPECT_SCRIPT" 2>/dev/null | grep -q "index.html"; then
        echo "✅ TROUVÉ: $path contient index.html"
        echo ""
        echo "Vérification du contenu:"
        cat > "$EXPECT_SCRIPT" << EOF
set timeout 10
spawn sftp -P $PORT -o StrictHostKeyChecking=no $USERNAME@$HOST
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "sftp>" {
        send "get $path/index.html /tmp/test-index.html\r"
        expect "sftp>"
        send "quit\r"
        expect eof
    }
}
EOF
        expect "$EXPECT_SCRIPT" > /dev/null 2>&1
        if grep -q "nav-search" /tmp/test-index.html 2>/dev/null; then
            echo "❌ Ce fichier contient encore nav-search (ancienne version)"
        else
            echo "✅ Ce fichier ne contient pas nav-search (version à jour)"
        fi
        rm -f /tmp/test-index.html
        break
    fi
done

rm -f "$EXPECT_SCRIPT"
