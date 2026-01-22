#!/usr/bin/env node

/**
 * Script de déploiement SFTP pour Night Square
 * Téléverse les fichiers modifiés sur le serveur SFTP
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Lire la configuration SFTP
const configPath = path.join(__dirname, 'sftp-config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ Fichier sftp-config.json introuvable !');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Extraire le host (enlever sftp:// si présent)
const host = config.host.replace(/^sftp:\/\//, '');
const port = config.port || 22;
const username = config.username;
const password = config.password;
const remotePath = config.remotePath || '/';
const localPath = config.localPath || './';

// Vérifier les informations
if (!host || !username) {
  console.error('❌ Host et username requis dans sftp-config.json !');
  process.exit(1);
}

console.log('🚀 Déploiement sur le serveur SFTP...\n');
console.log(`📡 Serveur: ${host}:${port}`);
console.log(`👤 Utilisateur: ${username}`);
console.log(`📁 Chemin distant: ${remotePath}\n`);

// Fichiers à déployer (ajustez selon vos besoins)
const filesToDeploy = [
  'index.html',
  'css/style.css',
  'js/main.js',
  'js/translations.js',
  'download.html',
  'events.html',
  'how-it-works.html',
  'organizers.html',
  'js/download.js',
  'js/events.js',
  'js/how-it-works.js',
  'js/organizers.js',
  'robots.txt',
  'sitemap.xml'
];

// Créer un script batch pour sftp
const sftpScript = filesToDeploy
  .filter(file => {
    const filePath = path.join(__dirname, file);
    return fs.existsSync(filePath);
  })
  .map(file => {
    const remoteDir = path.dirname(file).replace(/\\/g, '/');
    const remoteFile = file.replace(/\\/g, '/');
    return `put ${file} ${remotePath}${remoteFile}`;
  })
  .join('\n');

const sftpBatchFile = path.join(__dirname, '.sftp-batch.txt');
fs.writeFileSync(sftpBatchFile, sftpScript);

// Utiliser sshpass si disponible, sinon demander le mot de passe
let sftpCommand;
if (password) {
  // Vérifier si sshpass est installé
  try {
    execSync('which sshpass', { stdio: 'ignore' });
    sftpCommand = `sshpass -p '${password.replace(/'/g, "'\\''")}' sftp -P ${port} -o StrictHostKeyChecking=no -b ${sftpBatchFile} ${username}@${host}`;
  } catch (e) {
    console.log('⚠️  sshpass non installé. Installation recommandée pour automatisation.');
    console.log('   macOS: brew install hudochenkov/sshpass/sshpass');
    console.log('   Linux: apt-get install sshpass\n');
    console.log('📝 Utilisation de sftp interactif...');
    sftpCommand = `sftp -P ${port} -o StrictHostKeyChecking=no -b ${sftpBatchFile} ${username}@${host}`;
    console.log(`   Mot de passe: ${password}\n`);
  }
} else {
  sftpCommand = `sftp -P ${port} -o StrictHostKeyChecking=no -b ${sftpBatchFile} ${username}@${host}`;
}

try {
  console.log('📤 Upload des fichiers...\n');
  execSync(sftpCommand, { 
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, SSHPASS: password }
  });
  console.log('\n✅ Déploiement réussi !');
  
  // Nettoyer le fichier batch
  fs.unlinkSync(sftpBatchFile);
} catch (error) {
  console.error('\n❌ Erreur lors du déploiement:', error.message);
  if (fs.existsSync(sftpBatchFile)) {
    fs.unlinkSync(sftpBatchFile);
  }
  process.exit(1);
}
