# frozen_string_literal: true

require 'csv'

spells = CSV.parse(File.read(Rails.root.join('db/data/dnd2024_spells.csv')), headers: false, col_sep: ';')
spells.map! do |spell|
  {
    type: 'Dnd2024::Spell',
    slug: spell[1],
    name: {
      en: spell[2],
      ru: spell[3]
    },
    data: {
      level: spell[0].to_i,
      school: spell[4],
      available_for: spell[6].split(','),
      source: spell[5]
    },
    available_for: spell[6].split(',')
  }
end
Dnd2024::Spell.upsert_all(spells)

spells = CSV.parse(File.read(Rails.root.join('db/data/dnd5_spells.csv')), headers: false, col_sep: ';')
spells.map! do |spell|
  {
    type: 'Dnd5::Spell',
    slug: spell[1],
    name: {
      en: spell[2],
      ru: spell[3]
    },
    data: {
      level: spell[0].to_i,
      school: spell[4],
      available_for: spell[6].split(','),
      source: spell[5]
    },
    available_for: spell[6].split(',')
  }
end
Dnd5::Spell.upsert_all(spells)

items = CSV.parse(File.read(Rails.root.join('db/data/dnd5_items.csv')), headers: false, col_sep: ';')
items.map! do |item|
  {
    kind: item[0],
    slug: item[1],
    name: {
      en: item[2],
      ru: item[3]
    },
    data: {
      price: item[4].to_i,
      weight: item[5].to_f
    }
  }
end
Dnd5::Item.upsert_all(items)

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

Dir[File.join(Rails.root.join('db/data/dnd5_character_feats/*.json'))].each do |filename|
  puts "seeding - #{filename}"
  JSON.parse(File.read(filename)).each do |feat|
    ::Dnd5::Feat.create!(feat)
  end
end

Dir[File.join(Rails.root.join('db/data/dnd2024_character_feats/*.json'))].each do |filename|
  puts "seeding - #{filename}"
  JSON.parse(File.read(filename)).each do |feat|
    ::Dnd2024::Feat.create!(feat)
  end
end

Dir[File.join(Rails.root.join('db/data/daggerheart_feats/*.json'))].each do |filename|
  puts "seeding - #{filename}"
  JSON.parse(File.read(filename)).each do |feat|
    ::Daggerheart::Feat.create!(feat)
  end
end

weapons_file = File.read(Rails.root.join('db/data/weapons.json'))
weapons = JSON.parse(weapons_file)
Dnd5::Item.upsert_all(weapons) if weapons.any?

armor_file = File.read(Rails.root.join('db/data/armor.json'))
armor = JSON.parse(armor_file)
Dnd5::Item.upsert_all(armor) if armor.any?

armor_file = File.read(Rails.root.join('db/data/daggerheart_armor.json'))
armor = JSON.parse(armor_file)
Daggerheart::Item.upsert_all(armor) if armor.any?

armor_file = File.read(Rails.root.join('db/data/daggerheart_t2_armor.json'))
armor = JSON.parse(armor_file)
Daggerheart::Item.upsert_all(armor) if armor.any?

weapons_file = File.read(Rails.root.join('db/data/daggerheart_weapons.json'))
weapons = JSON.parse(weapons_file)
Daggerheart::Item.upsert_all(weapons) if weapons.any?

spells_file = File.read(Rails.root.join('db/data/daggerheart_spells.json'))
spells = JSON.parse(spells_file)
Daggerheart::Spell.upsert_all(spells) if spells.any?

spells_file = File.read(Rails.root.join('db/data/daggerheart_additional_spells.json'))
spells = JSON.parse(spells_file)
Daggerheart::Spell.upsert_all(spells) if spells.any?

armor_file = File.read(Rails.root.join('db/data/pathfinder2_armor.json'))
armor = JSON.parse(armor_file)
Pathfinder2::Item.upsert_all(armor) if armor.any?

weapons_file = File.read(Rails.root.join('db/data/pathfinder2_weapons.json'))
weapons = JSON.parse(weapons_file)
Pathfinder2::Item.upsert_all(weapons) if weapons.any?

user = User.create! locale: 'ru', password: SecureRandom.alphanumeric(24)
user.sessions.create!
