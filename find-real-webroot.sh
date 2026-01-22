#!/bin/bash

CONFIG_FILE="sftp-config.json"

HOST=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.host.replace(/^sftp:\\/\\//, ''))")
PORT=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.port || 22)")
USERNAME=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.username)")
PASSWORD=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c.password || '')")

echo "🔍 Recherche du répertoire web réel en listant les répertoires..."
echo ""

EXPECT_SCRIPT=$(mktemp)
cat > "$EXPECT_SCRIPT" << EOF
set timeout 15
spawn sftp -P $PORT -o StrictHostKeyChecking=no $USERNAME@$HOST
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "sftp>" {
        send "pwd\r"
        expect "sftp>"
        send "ls -la\r"
        expect "sftp>"
        send "quit\r"
        expect eof
    }
    timeout { exit 1 }
}
EOF

expect "$EXPECT_SCRIPT"
rm -f "$EXPECT_SCRIPT"

echo ""
echo "Maintenant, testons les chemins possibles pour trouver celui qui contient nav-search..."

PATHS=(
    "/"
    "/home/$USERNAME"
    "/home/$USERNAME/public_html"
    "/home/$USERNAME/www"
    "/var/www"
    "/var/www/html"
)

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
        send "get $path/index.html /tmp/test-$RANDOM.html\r"
        expect {
            "sftp>" { }
            "No such file" { exit 1 }
            timeout { exit 1 }
        }
        send "quit\r"
        expect eof
    }
}
EOF
    
    if expect "$EXPECT_SCRIPT" > /dev/null 2>&1; then
        TEST_FILE=$(ls -t /tmp/test-*.html 2>/dev/null | head -1)
        if [ -f "$TEST_FILE" ]; then
            if grep -q "nav-search" "$TEST_FILE" 2>/dev/null; then
                echo "🎯 TROUVÉ LE BON RÉPERTOIRE: $path"
                echo "   Ce fichier contient nav-search (ancienne version servie par le web)"
                echo ""
                echo "📋 Déploiement dans: $path"
                node -e "const c=require('./$CONFIG_FILE'); c.remotePath='$path'; require('fs').writeFileSync('./$CONFIG_FILE', JSON.stringify(c, null, 2));"
                ./deploy-sftp.sh
                rm -f "$TEST_FILE" /tmp/test-*.html
                exit 0
            fi
        fi
        rm -f "$TEST_FILE"
    fi
    rm -f "$EXPECT_SCRIPT"
done

echo "❌ Répertoire web non trouvé. Le serveur utilise peut-être un cache ou un autre mécanisme."
