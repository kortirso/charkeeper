# frozen_string_literal: true

require 'csv'

# spells_file = File.read(Rails.root.join('db/data/spells.json'))
# spells = JSON.parse(spells_file)
# spells.each do |spell|
#   ::Spell.create!({ type: 'Dnd5::Spell', slug: spell['slug'], name: spell['name'], data: spell.except('name', 'slug') })
# end

# https://github.com/Etignis/DnD_SpellList_eng_rus/blob/master/spells/allSpells.js
spells_file = File.read(Rails.root.join('db/data/full_spells.json'))
selected_spells = JSON.parse(spells_file).select { |spell| spell['en']['source'].include?('PHB') || spell['en']['source'].include?('XGTE') || spell['en']['source'].include?('TCoE') }
selected_spells = selected_spells.sort_by { |spell| spell['en']['level'].to_i }
selected_spells = selected_spells.map do |spell|
  [
    spell.dig('en', 'level').to_s,
    spell.dig('en', 'name'),
    spell.dig('ru', 'name'),
    spell.dig('en', 'school').downcase.strip,
    spell.dig('en', 'source')
  ]
end
File.write(Rails.root.join('db/data/dnd5_spells.csv'), selected_spells.map(&:to_csv).join)

spells = CSV.parse(File.read(Rails.root.join('db/data/dnd5_spells.csv')), headers: false)
spells.map! do |spell|
  {
    type: 'Dnd5::Spell',
    slug: spell[1].to_underscore,
    name: {
      en: spell[1],
      ru: spell[2]
    },
    data: {
      level: spell[0].to_i,
      school: spell[3],
      available_for: [],
      source: spell[4]
    }
  }
end
Dnd5::Spell.upsert_all(spells)

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

items_file = File.read(Rails.root.join('db/data/items.json'))
items = JSON.parse(items_file)
items.each do |item|
  ::Item.create!({ slug: item['slug'], type: 'Dnd5::Item', kind: item['kind'], name: item['name'], data: item.except('name', 'kind', 'slug') })
end

user = User.create! locale: 'ru'
user.sessions.create!
