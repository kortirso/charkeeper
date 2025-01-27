# frozen_string_literal: true

spells_file = File.read(Rails.root.join('db/data/spells.json'))
spells = JSON.parse(spells_file)
spells.each do |spell|
  ::Spell.create!({ type: 'Dnd5::Spell', name: spell['name'], data: spell.except('name') })
end

weapons_file = File.read(Rails.root.join('db/data/weapons.json'))
weapons = JSON.parse(weapons_file)
weapons.each do |weapon|
  ::Item.create!({ type: 'Dnd5::Item', kind: weapon['kind'], name: weapon['name'], data: weapon.except('name', 'kind') })
end

armor_file = File.read(Rails.root.join('db/data/armor.json'))
armor = JSON.parse(armor_file)
armor.each do |item|
  ::Item.create!({ type: 'Dnd5::Item', kind: item['kind'], name: item['name'], data: item.except('name', 'kind') })
end

items_file = File.read(Rails.root.join('db/data/items.json'))
items = JSON.parse(items_file)
items.each do |item|
  ::Item.create!({ type: 'Dnd5::Item', kind: item['kind'], name: item['name'], data: item.except('name', 'kind') })
end

user = User.create!

sariel = ::Character.create!(
  type: 'Dnd5::Character',
  name: 'Сариэль',
  user: user,
  data: {
    level: 2,
    race: Dnd5::Character::ELF,
    alignment: Dnd5::Character::NEUTRAL,
    main_class: Dnd5::Character::DRUID,
    classes: { druid: 2 },
    subclasses: { druid: nil },
    abilities: { str: 13, dex: 14, con: 13, int: 7, wis: 17, cha: 10 },
    health: { current: 13, max: 13, temp: 0 },
    speed: 35,
    selected_skills: [], # выбранные умения
    languages: ['common', 'elvish'], # изученные языки
    weapon_core_skills: [], # навыки владения группой оружия
    weapon_skills: [], # навыки владения отдельным оружием
    armor_proficiency: ['light armor', 'medium armor', 'shield'], # навыки владения броней
    class_features: [], # выбранные классовые умения
    coins: { gold: 330, silver: 0, copper: 0 },
    spent_spell_slots: { 1 => 0 }
  }
)

Dnd5::Spell.find_each do |spell|
  next unless spell.data.available_for.include?('druid')

  sariel.spells.create!(spell: spell, data: { ready_to_use: false, prepared_by: 'druid' })
end

::Character.create!(
  type: 'Dnd5::Character',
  name: 'Грундар',
  user: user,
  data: {
    level: 4,
    race: Dnd5::Character::HUMAN,
    alignment: Dnd5::Character::NEUTRAL,
    main_class: Dnd5::Character::MONK,
    classes: { monk: 4 },
    subclasses: { monk: nil },
    abilities: { str: 13, dex: 16, con: 14, int: 11, wis: 16, cha: 10 },
    energy: { monk: 4 }, # для варвара, монаха и чародея, текущее состояние
    health: { current: 27, max: 31, temp: 0 },
    speed: 30,
    selected_skills: ['acrobatics', 'perception'], # выбранные умения
    languages: ['common', 'dwarvish'], # изученные языки
    weapon_core_skills: ['light weapon'], # навыки владения группой оружия
    weapon_skills: ['Shortsword'], # навыки владения отдельным оружием
    armor_proficiency: [], # навыки владения броней
    class_features: [], # выбранные классовые умения
    coins: { gold: 250, silver: 0, copper: 0 }
  }
)

# языки
# common, dwarvish, elvish, giant, gnomish, goblin, halfling, orc, draconic, undercommon

::Character.create!(
  type: 'Dnd5::Character',
  name: 'Кормак',
  user: user,
  data: {
    level: 3,
    race: Dnd5::Character::DWARF,
    alignment: Dnd5::Character::NEUTRAL,
    main_class: Dnd5::Character::FIGHTER,
    abilities: { str: 16, dex: 11, con: 16, int: 8, wis: 13, cha: 12 },
    classes: { fighter: 3 },
    subclasses: { fighter: nil },
    health: { current: 24, max: 30, temp: 0 },
    speed: 25,
    selected_skills: [],
    languages: ['common', 'dwarvish'],
    weapon_core_skills: ['light weapon', 'martial weapon'],
    weapon_skills: ['Handaxe', 'Battleaxe', 'Light hammer', 'Warhammer'],
    armor_proficiency: ['light armor', 'medium armor', 'heavy armor', 'shield'],
    class_features: [],
    coins: { gold: 0, silver: 0, copper: 0 }
  }
)

::Character.create!(
  type: 'Dnd5::Character',
  name: 'Вестра',
  user: user,
  data: {
    level: 2,
    race: Dnd5::Character::HUMAN,
    alignment: Dnd5::Character::NEUTRAL,
    main_class: Dnd5::Character::SORCERER,
    abilities: { str: 9, dex: 11, con: 11, int: 15, wis: 14, cha: 17 },
    classes: { sorcerer: 2 },
    subclasses: { sorcerer: nil },
    energy: { sorcerer: 4 }, # для варвара, монаха и чародея, текущее состояние
    health: { current: 7, max: 12, temp: 0 },
    speed: 30,
    selected_skills: ['acrobatics', 'persuasion'], # выбранные умения
    languages: ['common', 'orc', 'draconic'], # изученные языки
    weapon_core_skills: [], # навыки владения группой оружия
    weapon_skills: ['Quarterstaff', 'Dagger', 'Dart', 'Sling'], # навыки владения оружием
    armor_proficiency: [], # навыки владения броней
    class_features: [], # выбранные классовые умения
    coins: { gold: 325, silver: 0, copper: 0 },
    spent_spell_slots: { 1 => 0 }
  }
)

# виды урона оружия
# колющий - pierce
# рубящий - slash
# дробящий - bludge

# свойства оружия
# ближний бой - melee
# метательное - thrown
# дальний бой - range

# фехтовальное - finesse
# лёгкое - light
# тяжёлое - heavy
# универсальное - versatile
# двуручное - 2handed
# досягаемость - reach
# перезарядка - reload
