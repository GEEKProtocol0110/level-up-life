# Level-Up Life — parent/adult site

A buildless introduction and personal quest planner for adults and parents, developed alongside https://github.com/GEEKProtocol0110/level-up-life.

## Run

From this folder, run `python3 -m http.server 8080` and open http://localhost:8080. No dependencies or build step. For Sites publishing, the same assets are placed in the Site source repository’s `dist/` directory.

## Included

- Responsive landing page, seven life domains, accessible dialogs and navigation.
- Custom dated quests, completion/undo, domain templates and XP progression.
- XP uses the repository's `100 + level * 25` per-level threshold and `10 * (1 + (difficulty - 1) * 0.5)` quest rewards.
- Browser-local storage, JSON export and validated additive backup restore.
- Sample 50/40/10 spend/save/give calculator using integer cents.

## Boundary

This is a personal prototype for adults and parents. It does not provide account creation, shared family or child accounts, cloud sync, allowance transfers, payments, or wallet custody. These features require separate integration and verification with the existing Supabase app. XP has no monetary value. Plans remain in each browser and are not encrypted; use for ordinary task planning.

The production Sites origin and the GitHub app are separate deployments. Changing one does not automatically update the other. The GitHub copy is under `apps/parent-site/`.
