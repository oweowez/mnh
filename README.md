# Plateforme Fondation MNH — Santé des professionnels de santé

Base de connaissances **administrable et évolutive** sur la santé des professionnels de santé
(V1 conforme au brief développeur — pas un rapport en ligne, mais un graphe relationnel
professions ↔ thématiques ↔ contenus ↔ études ↔ publications).

## Démarrage

```bash
npm install
cp .env.example .env      # renseigner ANTHROPIC_API_KEY et ADMIN_PASSWORD
npm run dev               # http://localhost:3100
```

Au premier démarrage, la base SQLite (`data/mnh.db`) est créée et **seedée automatiquement**
depuis `data/seed.json` (généré par `scripts/build-seed.py` à partir de l'Excel
« Base éditoriale 8 groupes » et du document général : 8 professions, 10 thématiques
canoniques, 56 contenus, 14 études, pages transversales).

## Espaces

- **Site public** : accueil (3 entrées + chaîne d'effets), « Comprendre les enjeux »,
  pages professions (template dynamique), pages thématiques (lecture croisée),
  bibliothèque « Recherches & projets », recherche simple.
- **Administration** (`/admin`, mot de passe `ADMIN_PASSWORD`, défaut dev `mnh2026`) :
  CRUD professions / thématiques / contenus / études / pages générales,
  et le workflow **Publications & IA**.

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

## Modèle de données (SQLite, `lib/db.ts`)

`professions`, `themes` (taxonomie canonique + libellé d'affichage par fiche),
`contents` (profession × thématique), `studies`, `content_refs`, `study_professions`,
`study_themes`, `pages`, `publications`, `proposals`, `content_versions`.

Rien n'est codé en dur : professions et thématiques s'ajoutent depuis l'admin (brief §6).

## Non couvert en V1 (pistes V2)

- Comptes multi-utilisateurs et rôle « expert » à périmètre restreint (brief §20).
- Création automatique d'une fiche « étude » depuis une publication intégrée.
- Import DOI via API Crossref (le champ DOI est traité comme référence texte).
- Chatbot public (explicitement hors V1 dans le brief §23).
