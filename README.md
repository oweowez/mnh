# Plateforme Fondation MNH — Santé des professionnels de santé

Base de connaissances **administrable et évolutive** sur la santé des professionnels de santé
(V1 conforme au brief développeur — pas un rapport en ligne, mais un graphe relationnel
professions ↔ thématiques ↔ contenus ↔ études ↔ publications).

## Démarrage

```bash
npm install
cp .env.example .env      # renseigner ANTHROPIC_API_KEY et AUTH_SECRET
npm run dev               # http://localhost:3100
```

Les données éditoriales vivent dans **Supabase Postgres** (tables verrouillées par RLS,
accès serveur uniquement via la clé `service_role`). Pour initialiser un projet Supabase neuf :

1. exécuter `supabase/schema.sql` (SQL Editor ou psql) ;
2. lancer `node scripts/migrate-to-supabase.mjs` — source : `data/mnh.db` si présent,
   sinon `data/seed.json` (généré par `scripts/build-seed.py` depuis l'Excel
   « Base éditoriale 8 groupes » : 8 professions, 10 thématiques canoniques,
   56 contenus, 14 études, pages transversales).

## Espaces

- **Site public** : accueil (recherche, professions, thématiques, chaîne d'effets),
  « Comprendre les enjeux », pages professions (template dynamique, sommaire latéral),
  index et pages thématiques (lecture croisée), bibliothèque « Recherches & projets »,
  recherche simple. Les renvois « [5] » des textes deviennent des liens vers les études.
- **Administration** (`/admin`) :
  CRUD professions / thématiques / contenus / études / pages générales,
  le workflow **Publications & IA**, et la gestion des utilisateurs.

## Design

Charte Fondation MNH (`app/globals.css`) : marine `#083264`, nuit `#091a41`, turquoise `#79c7c7`,
jaune `#fec700` et leurs pastels. Titres en ITC Avant Garde (`public/fonts`), texte courant en Inter
(`next/font`). Motifs repris du logo : arcs décoratifs (`components/Arcs.tsx`) et barre jaune sous les titres.

> Ne pas lancer `next build` dans ce dossier pendant que `npm run dev` tourne : les deux écrivent
> dans `.next` et le serveur de dev se met à renvoyer des erreurs 500 (il faut alors le relancer
> après `rm -rf .next`).

## Comptes & rôles

- **Inscription** : `/admin/inscription` — le compte est créé en statut « en attente ».
- **Validation** : un **super-admin** valide (accès au dashboard) ou refuse chaque demande
  depuis `/admin/utilisateurs`. Il peut aussi promouvoir un administrateur en super-admin.
- **Premier super-admin** (bootstrap, directement en base) :
  ```bash
  node scripts/promote.mjs               # liste les comptes
  node scripts/promote.mjs vous@mail.fr  # passe ce compte super-admin
  ```
- Sessions : cookie signé HMAC (`AUTH_SECRET` en production).
- Chaque action (validation de proposition IA, modification de contenu) est tracée
  au nom de l'utilisateur connecté.
- Les comptes vivent dans **Supabase Auth** (`lib/supabase.ts`) : le rôle est stocké
  dans `app_metadata` (modifiable uniquement avec la clé secrète serveur).
  Renseigner `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et
  `SUPABASE_SERVICE_ROLE_KEY` dans `.env`.

## Workflow IA (back-office uniquement)

1. « + Ajouter une publication » : lien, DOI, PDF ou texte.
2. « Lancer l'analyse IA » → fiche structurée (Claude `claude-opus-5`, sorties structurées Zod),
   puis comparaison avec les fiches existantes → propositions typées :
   déjà couvert / enrichissement (diff mot à mot) / information nouvelle / nouvelle thématique.
3. Chaque proposition : **Pourquoi ?** + **extrait source** (traçabilité) + **Accepter / Modifier / Refuser**.
4. Une acceptation archive la version précédente dans `content_versions`
   (qui, quand, motif, publication justificative). L'IA ne publie jamais rien seule.

Garde-fous scientifiques (brief §18) codés dans les prompts (`lib/ai.ts`) :
résultat transversal jamais attribué à une profession, association ≠ causalité,
« non précisé » plutôt qu'inventer.

## Modèle de données (Supabase Postgres — `supabase/schema.sql`, accès via `lib/repo.ts`)

`professions`, `themes` (taxonomie canonique + libellé d'affichage par fiche),
`contents` (profession × thématique), `studies`, `content_refs`, `study_professions`,
`study_themes`, `pages`, `publications`, `proposals`, `content_versions`
+ vues `v_contents_full` et `v_recent_versions`. RLS activé sans policy :
seule la clé serveur accède aux données ; l'app rend les pages côté serveur.

Rien n'est codé en dur : professions et thématiques s'ajoutent depuis l'admin (brief §6).

## Non couvert en V1 (pistes V2)

- Comptes multi-utilisateurs et rôle « expert » à périmètre restreint (brief §20).
- Création automatique d'une fiche « étude » depuis une publication intégrée.
- Import DOI via API Crossref (le champ DOI est traité comme référence texte).
- Chatbot public (explicitement hors V1 dans le brief §23).
