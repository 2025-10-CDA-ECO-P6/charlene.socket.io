# Journal d'itération — Puissance 4 en TDD

> Projet : Jeu Puissance 4 multijoueur
> Diplôme : Concepteur Développeur d'Applications (CDA)
> Méthodologie : Test Driven Development (Red → Green → Refactor)

---

## Règles métier identifiées

Avant de commencer le développement, les règles métier ont été listées et priorisées :

| #   | Règle métier |
| --- | --- |
| 1   | La grille fait 6 lignes × 7 colonnes, toutes les cellules sont vides au départ |
| 2   | Il y a 2 joueurs : Joueur 1 (🔴) et Joueur 2 (🟡), le Joueur 1 commence |
| 3   | Un joueur choisit une colonne, le jeton tombe en bas de la colonne (gravité) |
| 4   | On ne peut pas jouer dans une colonne pleine |
| 5   | Les joueurs alternent à chaque coup |
| 6   | Un joueur gagne s'il aligne 4 jetons horizontalement |
| 7   | Un joueur gagne s'il aligne 4 jetons verticalement |
| 8   | Un joueur gagne s'il aligne 4 jetons en diagonale |
| 9   | Si la grille est pleine sans alignement → match nul |

---
