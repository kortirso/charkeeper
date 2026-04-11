# README

### E2E tests

With browser
```bash
$ yarn add cypress@14.5.4 --dev
$ rails server -e test -p 5002
$ yarn cypress open --project ./spec/e2e
$ yarn remove cypress
```

Headless
```bash
$ yarn add cypress@14.5.4 --dev
$ rails server -e test -p 5002
$ yarn run cypress run --project ./spec/e2e
$ yarn remove cypress
```

### Info options for PF2 characters

```bash
"info": { "change_character": { "attr": "archetypes", "type": "push", "value": "bard" } }

"info": { "options_list": "skills" }
"info": { "options_list": "classes" }
"info": { "options_list": "subclasses" }
"info": { "options_list": "spellLists" }
"info": { "options_list": "races" }

"info": { "extra_feats": ["ride"] }
"info": { "required": ["tough"] }

"info": { "focus_spells": ["hymn_of_healing"] }
"info": { "static_spells": { "detect_magic": { "limit": null } } }
"info": { "static_spells": { "oaken_resilience": { "limit": 1 }, "entangle": { "limit": 1 } } }

"info": { "weapons": [{ "items_slug": "razortooth", "items_name": { "en": "Jaws", "ru": "Челюсти" }, "items_info": { "group": "brawling", "weapon_skill": "unarmed", "type": "melee", "damage": "1d6", "damage_type": "pierce", "tooltips": ["finesse", "unarmed"] } }] }

"info": { "weapons": [{ "items_slug": "seedpod", "items_name": { "en": "Seedpod", "ru": "Побег" }, "items_info": { "weapon_skill": "unarmed", "type": "range", "damage": "1d4", "damage_type": "bludge", "tooltips": ["unarmed"], "dist": 30 } }] }
```
