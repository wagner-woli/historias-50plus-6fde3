# Historias da Minha Vida - Registro de Progresso
## Data: 31/03/2026

---

## PROJETO
- **App**: Historias da Minha Vida - IA Geracao 50+
- **Arquivo principal**: /Users/wagner/Desktop/historias-50plus.html
- **Supabase Org**: historias-50plus
- **Supabase Project ID**: otesxnhbwujhdbxjzjiw
- **Supabase URL**: https://otesxnhbwujhdbxjzjiw.supabase.co
- **Supabase Key**: sb_publishable_BycfL_RDGy7bdvCJmVJG4w_Zp6wxizv
- **Google Cloud Project**: Gemini Project (gen-lang-client-0339532866)
- **Google OAuth Client ID**: 275576849905-c7h44me7lr88i3is2cd66qmp030dc92u.apps.googleusercontent.com
- **Auth Provider**: Google (habilitado no Supabase)
- **Status OAuth**: Em producao (publicado)

---

## TABELAS SUPABASE

### historias
| Coluna | Tipo |
|---|---|
| id | uuid (PK) |
| user_id | uuid (FK auth.users) |
| titulo | text |
| corpo | text |
| memoria_original | text |
| estilo | text |
| publico | text (adulto/infantil) |
| url_de_audio | text |
| url_publica | text |
| visivel | bool |
| criado_em | timestamptz |

### profiles
- Existe mas nao foi inspecionada em detalhe

---

## O QUE FOI FEITO NESTA SESSAO (31/03/2026)

### 1. Correcao Login Google - Nome do App
- **Problema**: Tela de login do Google mostrava "otesxnhbwujhdbxjzjiw.supabase.co" em vez do nome do app
- **Acao**: Publicamos o app no Google Cloud Console (de "Testando" para "Em producao")
- **Resultado**: O nome "Historias da Minha Vida" ja esta configurado no Branding, porem o Google exibe o dominio da redirect URI do Supabase. Solucao definitiva seria dominio personalizado (Supabase Pro $25/mes)

### 2. Implementacao - Salvar Historias + Meu Acervo
- **Adicionado ao app**:
  - Supabase JS v2 (CDN)
  - Botao "Entrar com Google" no header
  - Exibicao do nome do usuario logado + botao Sair
  - Botao "Salvar" apos gerar historia (salva no Supabase)
  - Aba "Meu Acervo" com:
    - Lista de historias salvas (cards com preview)
    - Badge com contagem de historias
    - Modal para ler historia completa
    - Mensagem amigavel quando nao logado ou sem historias
  - Navegacao por abas (Criar / Meu Acervo)
- **Nota tecnica**: variavel do cliente Supabase renomeada para `sb` (evitar conflito com window.supabase)

---

## BUG PENDENTE
- **Problema**: Ao gerar historia, fica travado em "A IA esta escrevendo sua historia..." - nao completa
- **Possivel causa**: A chamada a API da Anthropic (fetch para https://api.anthropic.com/v1/messages) nao tem header `x-api-key`. Na versao anterior funcionava - pode ter havido alguma mudanca ou o app original usava um proxy/edge function. VERIFICAR se havia um header de API key que foi perdido na reescrita, ou se o app era servido de um dominio especifico (ex: Netlify) que adicionava o header via proxy.
- **Acao**: Comparar com versao anterior ou verificar se o app original usava Supabase Edge Functions ou proxy para a API

---

## RECURSO EXISTENTE NAO INTEGRADO
- **Audio (ElevenLabs)**: O app original tinha um botao "Ouvir" que gerava audio via ElevenLabs TTS apos escrever a historia. Este recurso precisa ser re-integrado na nova versao.
- **Coluna url_de_audio**: Existe na tabela mas esta NULO em todos os registros. Quando o audio for integrado, salvar a URL do audio gerado nesta coluna.

---

## ROADMAP (proximos passos)

### Prioridade 1 - CORRIGIR
- [ ] Bug da geracao de historia (API Anthropic - verificar API key / proxy)
- [ ] Re-integrar audio ElevenLabs (botao Ouvir)

### Prioridade 2 - EVOLUIR
- [ ] Salvar audio no Supabase Storage + gravar url_de_audio
- [ ] Compartilhar audio pelo WhatsApp
- [ ] Gerar PDF/Livro com historias acumuladas

### Prioridade 3 - FUTURO
- [ ] Adicionar fotos as memorias
- [ ] Monetizacao (plano freemium)
- [ ] Dominio personalizado no Supabase (resolver nome no login Google)

---

## ARQUIVOS IMPORTANTES
- App principal: /Users/wagner/Desktop/historias-50plus.html
- Este roadmap: /Users/wagner/Desktop/HISTORIAS-50PLUS-ROADMAP.md
