# frozen_string_literal: true

spells_file = File.read(Rails.root.join('db/data/spells.json'))
spells = JSON.parse(spells_file)
spells.each do |spell|
  ::Spell.create!({ type: 'Dnd5::Spell', slug: spell['slug'], name: spell['name'], data: spell.except('name', 'slug') })
end

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
