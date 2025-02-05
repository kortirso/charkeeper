# frozen_string_literal: true

require 'csv'

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
    }
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

weapons_file = File.read(Rails.root.join('db/data/weapons.json'))
weapons = JSON.parse(weapons_file)
weapons.each do |weapon|
  ::Item.create!({ slug: weapon['slug'], type: 'Dnd5::Item', kind: weapon['kind'], name: weapon['name'], data: weapon.except('name', 'kind', 'slug') })
end

armor_file = File.read(Rails.root.join('db/data/armor.json'))
armor = JSON.parse(armor_file)
armor.each do |item|
  ::Item.create!({ slug: item['slug'], type: 'Dnd5::Item', kind: item['kind'], name: item['name'], data: item.except('name', 'kind', 'slug') })
end

user = User.create! locale: 'ru'
user.sessions.create!
