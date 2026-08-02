#!/usr/bin/env node
/* =============================================================
 * build/build-single.js
 * Gera dist/index.html: um único arquivo autocontido com HTML,
 * CSS e todo o JavaScript embutido — formato ideal para publicar
 * no kimi.page (ou em qualquer hospedagem estática).
 *
 * Uso:  node build/build-single.js
 *
 * Como os módulos são scripts clássicos que se registram em
 * window.LDB, basta concatená-los na mesma ordem do index.html.
 * ============================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'dist');
const OUT = path.join(OUT_DIR, 'index.html');

// Mesma ordem do index.html — dependências antes dos dependentes.
const SCRIPTS = [
  'src/util.js',
  'src/localization.js',
  'src/data/balance.js',
  'src/data/heroes.js',
  'src/data/enemies.js',
  'src/data/equipment.js',
  'src/data/regions.js',
  'src/data/quests.js',
  'src/data/companions.js',
  'src/data/achievements.js',
  'src/data/crafting.js',
  'src/art.js',
  'src/audio.js',
  'src/save.js',
  'src/combat.js',
  'src/idle.js',
  'src/game.js',
  'src/render.js',
  'src/ui.js',
  'src/main.js'
];

function read(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { console.error('[build] arquivo ausente:', rel); process.exit(1); }
  return fs.readFileSync(p, 'utf8');
}

/** Evita que "</script>" dentro de uma string quebre o HTML. */
function safeForInlineScript(js) {
  return js.replace(/<\/script>/gi, '<\\/script>');
}

function main() {
  const css = read('styles.css');
  const html = read('index.html');

  // O <head> é preservado literalmente. Extrair tag a tag com regex é frágil:
  // o favicon é um data URI de SVG e contém '>' dentro do atributo href, o que
  // truncava a tag e engolia o <style> inteiro — o build saía sem CSS nenhum.
  const headStart = html.indexOf('<head>') + '<head>'.length;
  const headEnd = html.indexOf('</head>');
  if (headStart < 6 || headEnd < 0) { console.error('[build] <head> não encontrado em index.html'); process.exit(1); }
  let head = html.slice(headStart, headEnd);
  // remove só a referência ao CSS externo — ele vai embutido logo abaixo
  head = head.replace(/[ \t]*<link[^>]*rel=["']stylesheet["'][^>]*>\s*/gi, '');

  let js = '';
  let bytes = 0;
  SCRIPTS.forEach((rel) => {
    const src = read(rel);
    bytes += Buffer.byteLength(src, 'utf8');
    js += '\n/* ======== ' + rel + ' ======== */\n' + src + '\n';
  });

  const out =
`<!DOCTYPE html>
<html lang="pt-BR">
<head>${head}
<style>
${css}
</style>
</head>
<body>
<div id="app"></div>
<noscript style="color:#fff;font-family:monospace;padding:1rem;display:block">
  Este jogo precisa de JavaScript habilitado. / This game requires JavaScript.
</noscript>
<script>
${safeForInlineScript(js)}
</script>
</body>
</html>
`;

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, out, 'utf8');

  const kb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1);
  console.log('[build] ' + SCRIPTS.length + ' scripts (' + (bytes / 1024).toFixed(1) + ' KB) + CSS embutidos');
  console.log('[build] gerado: dist/index.html (' + kb + ' KB)');
  console.log('[build] publique esse arquivo sozinho — não há dependências externas.');
}

main();
