#!/usr/bin/env bash
# Puxa as chaves do Supabase e escreve no .env.local.
#
# Rode DEPOIS de `supabase login` e `supabase link`.
# As chaves vão direto do Supabase para o arquivo — nada é digitado
# à mão e nada aparece colado em lugar nenhum.
#
#   bash scripts/preencher-env-supabase.sh

set -euo pipefail

REF="fcmssebykjxcmgmyvvra"
ENV_FILE=".env.local"

command -v supabase >/dev/null || { echo "❌ CLI do Supabase não encontrada. Rode: brew install supabase/tap/supabase"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "❌ $ENV_FILE não existe."; exit 1; }

echo "→ buscando as chaves do projeto $REF…"
JSON="$(supabase projects api-keys --project-ref "$REF" --output json)"

ANON="$(printf '%s' "$JSON" | python3 -c "
import json,sys
ks=json.load(sys.stdin)
for k in ks:
    if k.get('name') in ('anon','publishable') and not k.get('disabled'):
        print(k['api_key']); break
")"

SERVICE="$(printf '%s' "$JSON" | python3 -c "
import json,sys
ks=json.load(sys.stdin)
for k in ks:
    if k.get('name') in ('service_role','secret') and not k.get('disabled'):
        print(k['api_key']); break
")"

[ -n "$ANON" ]    || { echo "❌ não achei a chave anon/publishable"; exit 1; }
[ -n "$SERVICE" ] || { echo "❌ não achei a chave service_role/secret"; exit 1; }

# escreve preservando o resto do arquivo
python3 - "$ENV_FILE" "$ANON" "$SERVICE" <<'PY'
import io,sys,re
arq, anon, service = sys.argv[1], sys.argv[2], sys.argv[3]
s = io.open(arq, encoding='utf-8').read()
s = re.sub(r'^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$', f'NEXT_PUBLIC_SUPABASE_ANON_KEY="{anon}"', s, flags=re.M)
s = re.sub(r'^SUPABASE_SERVICE_ROLE_KEY=.*$',    f'SUPABASE_SERVICE_ROLE_KEY="{service}"',   s, flags=re.M)
io.open(arq, 'w', encoding='utf-8').write(s)
PY

echo "✓ .env.local preenchido."
echo "  anon:         ${ANON:0:12}…  (${#ANON} caracteres)"
echo "  service_role: ${SERVICE:0:12}…  (${#SERVICE} caracteres)"
echo
echo "Agora reinicie o dev: Ctrl+C e npm run dev"
