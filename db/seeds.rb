# frozen_string_literal: true

dnd5 = Rule.create!(name: 'D&D 5')

user = User.create!

# языки
# common, dwarvish, elvish, giant, gnomish, goblin, halfling, orc, draconic, undercommon

kormak = dnd5.characters.create!(
  user: user,
  name: 'Кормак',
  data: {
    race: 'dwarf',
    alignment: 'neutral',
    abilities: { str: 16, dex: 11, con: 16, int: 8, wis: 13, cha: 12 },
    classes: { fighter: 3 },
    subclasses: { fighter: nil },
    health: { current: 24, max: 30, temp: 0 },
    speed: 25,
    skills: [],
    languages: ['common', 'dwarvish'],
    weapon_core_skills: [],
    weapon_skills: ['handaxe', 'battleaxe', 'light hammer', 'warhammer'],
    armor_skills: ['light', 'medium'],
    class_features: [],
    coins: { gold: 0, silver: 0, copper: 0 }
  }
)

grundar = dnd5.characters.create!(
  user: user,
  name: 'Грундар',
  data: {
    race: 'human',
    alignment: 'lawful neutral',
    abilities: { str: 13, dex: 16, con: 14, int: 11, wis: 16, cha: 10 },
    classes: { monk: 4 },
    subclasses: { monk: nil },
    energy: { monk: 4 }, # для варвара, монаха и чародея, текущее состояние
    health: { current: 27, max: 31, temp: 0 },
    speed: 30,
    skills: ['acrobatics', 'perception'], # выбранные умения
    languages: ['common', 'dwarvish'], # изученные языки
    weapon_core_skills: ['light'], # навыки владения группой оружия
    weapon_skills: ['shortsword'], # навыки владения оружием
    armor_skills: [], # навыки владения броней
    class_features: [], # выбранные классовые умения
    coins: { gold: 250, silver: 0, copper: 0 }
  }
)

vestra = dnd5.characters.create!(
  user: user,
  name: 'Вестра',
  data: {
    race: 'human',
    alignment: 'chaotic good',
    abilities: { str: 9, dex: 11, con: 11, int: 15, wis: 14, cha: 17 },
    classes: { sorcerer: 2 },
    subclasses: { sorcerer: nil },
    energy: { sorcerer: 4 }, # для варвара, монаха и чародея, текущее состояние
    health: { current: 7, max: 12, temp: 0 },
    speed: 30,
    skills: ['acrobatics', 'persuasion'], # выбранные умения
    languages: ['common', 'orc', 'draconic'], # изученные языки
    weapon_core_skills: ['light'], # навыки владения группой оружия
    weapon_skills: ['staff, dagger'], # навыки владения оружием
    armor_skills: [], # навыки владения броней
    class_features: [], # выбранные классовые умения
    coins: { gold: 325, silver: 0, copper: 0 }
  }
)

torch = dnd5.items.create!(kind: 'item', name: { en: 'Torch', ru: 'Факел' }, weight: 1, price: 1)

# виды урона оружия
# колющий - pierce
# рубящий - slash
# дробящий - bludge

# свойства оружия
# метательное - thrown
# фехтовальное - finesse
# лёгкое - light
# тяжёлое - heavy
# универсальное - versatile
# двуручное - 2handed
# досягаемость - reach

sickle = dnd5.items.create!(kind: 'light melee weapon', name: { en: 'Sickle', ru: 'Серп' }, weight: 2, price: 100, data: { damage: '1d4', type: 'slash', caption: ['light'] })
quarterstaff = dnd5.items.create!(kind: 'light melee weapon', name: { en: 'Quarterstaff', ru: 'Боевой посох' }, weight: 4, price: 20, data: { damage: '1d6', type: 'bludge', caption: ['versatile-1d8'] })
dart = dnd5.items.create!(kind: 'light range weapon', name: { en: 'Dart', ru: 'Дротик' }, weight: 0.25, price: 5, data: { dist: '20/60', damage: '1d4', type: 'pierce', caption: ['finesse'] })

shield = dnd5.items.create(kind: 'shield', name: { en: 'Shield', ru: 'Щит' }, weight: 6, price: 1_000, data: { ac: 2, str_req: nil, stealth: true })
dnd5.items.create(kind: 'light armor', name: { en: 'Leather armor', ru: 'Кожаный' }, weight: 10, price: 1_000, data: { ac: 11, str_req: nil, stealth: true })
scale_mail_armor = dnd5.items.create(kind: 'medium armor', name: { en: 'Scale mail armor', ru: 'Чешуйчатый' }, weight: 45, price: 5_000, data: { ac: 14, str_req: nil, stealth: false })
dnd5.items.create(kind: 'heavy armor', name: { en: 'Chain mail', ru: 'Кольчуга' }, weight: 55, price: 7_500, data: { ac: 16, str_req: 13, stealth: false })

grundar.items.create!(item: torch, quantity: 9)
grundar.items.create!(item: sickle, quantity: 1, ready_to_use: true)
grundar.items.create!(item: quarterstaff, quantity: 1, ready_to_use: true)
grundar.items.create!(item: dart, quantity: 10, ready_to_use: true)

kormak.items.create!(item: torch, quantity: 10)
kormak.items.create!(item: shield, quantity: 1, ready_to_use: true)
kormak.items.create!(item: scale_mail_armor, quantity: 1, ready_to_use: true)

vestra.items.create!(item: torch, quantity: 9)

ray_of_frost = dnd5.spells.create!(slug: 'ray_of_frost', name: { en: 'Ray of Frost', ru: 'Луч холода' }, level: 0, attacking: true, comment: { en: '', ru: 'PHB, 236' })
vestra.spells.create!(spell: ray_of_frost, ready_to_use: true, data: { class: 'sorcerer' })

sleep_spell = dnd5.spells.create!(slug: 'sleep_spell', name: { en: 'Sleep', ru: 'Усыпление' }, level: 1, attacking: false, comment: { en: '', ru: 'PHB, 286' })
vestra.spells.create!(spell: sleep_spell, ready_to_use: true, data: { class: 'sorcerer' })

magic_missile = dnd5.spells.create!(slug: 'magic_missile', name: { en: 'Magic Missile', ru: 'Волшебная стрела' }, level: 1, attacking: true, comment: { en: '', ru: 'PHB, 216' })
vestra.spells.create!(spell: magic_missile, ready_to_use: true, data: { class: 'sorcerer' })
