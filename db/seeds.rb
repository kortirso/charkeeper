# frozen_string_literal: true

require 'csv'

spells = CSV.parse(File.read(Rails.root.join('db/data/dnd2024/spells.csv')), headers: false, col_sep: ';')
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

spells = CSV.parse(File.read(Rails.root.join('db/data/dnd5/spells.csv')), headers: false, col_sep: ';')
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

items = CSV.parse(File.read(Rails.root.join('db/data/dnd5/items.csv')), headers: false, col_sep: ';')
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

items = CSV.parse(File.read(Rails.root.join('db/data/daggerheart/items.csv')), headers: false, col_sep: ';')
items.map! do |item|
  {
    kind: item[0],
    slug: item[1],
    name: {
      en: item[2],
      ru: item[3]
    }
  }
end
Daggerheart::Item.upsert_all(items)

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

Dir[File.join(Rails.root.join('db/data/dnd5/features/*.json'))].each do |filename|
  puts "seeding - #{filename}"
  JSON.parse(File.read(filename)).each do |feat|
    ::Dnd5::Feat.create!(feat)
  end
end

Dir[File.join(Rails.root.join('db/data/dnd2024/features/*.json'))].each do |filename|
  puts "seeding - #{filename}"
  JSON.parse(File.read(filename)).each do |feat|
    ::Dnd2024::Feat.create!(feat)
  end
end

Dir[File.join(Rails.root.join('db/data/daggerheart/feats/*.json'))].each do |filename|
  puts "seeding - #{filename}"
  JSON.parse(File.read(filename)).each do |feat|
    ::Daggerheart::Feat.create!(feat)
  end
end

Dir[File.join(Rails.root.join('db/data/dc20/spells.json'))].each do |filename|
  puts "seeding - #{filename}"
  JSON.parse(File.read(filename)).each do |feat|
    ::Dc20::Feat.create!(feat)
  end
end


markdown = ActiveMarkdown.new
file_content = File.read('db/data/dc20/spells.json')
feats = JSON.parse(file_content)
feats.each do |feat|
  feat['info']['enhancements'].map! do |item|
    item['description'].transform_values! { |value| markdown.call(value: value).strip }
    item
  end
  ::Dc20::Feat.create!(feat)
end

markdown = ActiveMarkdown.new
file_content = File.read('db/data/dc20/maneuvers.json')
feats = JSON.parse(file_content)
feats.each do |feat|
  feat['info']['enhancements'].map! do |item|
    item['description'].transform_values! { |value| markdown.call(value: value).strip }
    item
  end
  ::Dc20::Feat.create!(feat)
end


Dir[File.join(Rails.root.join('db/data/pathfinder2/feats/*.json'))].each do |filename|
  puts "seeding - #{filename}"
  JSON.parse(File.read(filename)).each do |feat|
    ::Pathfinder2::Feat.create!(feat)
  end
end

Dir[File.join(Rails.root.join('db/data/fallout/perks/*.json'))].each do |filename|
  puts "seeding - #{filename}"
  JSON.parse(File.read(filename)).each do |feat|
    ::Fallout::Feat.create!(feat)
  end
end

file_content = File.read('db/data/daggerheart/domains-output.txt')
file_content.lines.each do |line|
  names = line.split('|')
  en_name = names[1]
  ru_name = names[2].strip
  feat = Daggerheart::Feat.where(origin: 7).find_by("title ->> 'en' = ?", en_name)
  next unless feat

  feat.update(title: feat.title.merge('ru-DHM' => ru_name)) if ru_name != feat.title['ru']
end

file_content = File.read('db/data/fallout/raw_data/weapons.json')
data_hash = JSON.parse(file_content)

ranges = { 'C' => 'close', 'M' => 'medium', 'L' => 'long' }

data_hash = data_hash.map do |item|
  {
    slug: item['imageName'].underscore.gsub(' ', '_'),
    kind: item['Weapon Type'].underscore.gsub(' ', '_'),
    name: { en: item['imageName'], ru: item['Name'] },
    data: {
      weight: item['Weight'] == '<1' ? 1 : item['Weight'].to_i,
      price: item['Cost'],
      rarity: item['Rarity']
    },
    info: {
      rating: item['Damage Rating'],
      effects: item['Damage Effects'].split(', ').map { |item| item.underscore.gsub(' ', '-') },
      damage: item['Damage Type'].split(' / ').map { |item| item.underscore },
      rate: item['Rate of Fire'],
      range: item['Range'].present? ? ranges[item['Range']] : nil,
      qualities: item['Qualities'].split(', ').map { |item| item.underscore.gsub(' ', '_') },
    }.compact
  }
end

beautified_json_string = JSON.pretty_generate(data_hash)
# # Write the beautified JSON string to a file
File.open('db/data/fallout/weapons.json', 'w') do |file|
  file.write(beautified_json_string)
end

# file_content = File.read('db/data/daggerheart/spells-en.json')
# data_hash_en = JSON.parse(file_content)['data']

# data_hash = data_hash_en.map do |item|
#   ru_item = data_hash_ru.find { |i| i['slug'] == item['slug'] }

#   {
#     slug: item['slug'],
#     title: { en: item['name'], ru: ru_item['name'] },
#     description: {
#       en: item['features'][0]['main_body'],
#       ru: ru_item['features'][0]['main_body']
#     },
#     origin: 'domain_card',
#     origin_value: item['domain_slug'],
#     kind: 'static',
#     description_eval_variables: {
#       limit: "1"
#     },
#     eval_variables: {
#       damage_thresholds: "damage_thresholds.merge({ 'severe' => damage_thresholds['severe'] + 8 })"
#     },
#     limit_refresh: "long_rest",
#     conditions: { level: item['level'] },
#     continious: false
#   }
# end

# client = HttpService::Client.new(url: 'https://new.ttg.club')
# response = links.map do |url|
#   sleep(1)
#   client.get(path: "/api/v2/#{url}")[:body]
# end

# beautified_json_string = JSON.pretty_generate(response)
# # # Write the beautified JSON string to a file
# File.open('db/data/dnd2024/spells.json', 'w') do |file|
#   file.write(beautified_json_string)
# end

json = {
  "slug": "psychic_blades",
  "kind": "weapon",
  "name": { "en": "Psychic Blades", "ru": "Психические клинки" },
  "data": {},
  "info": {
    "weapon_skill": "light",
    "type": "thrown",
    "dist": "60/120",
    "damage": "1d6",
    "damage_type": "psychic",
    "caption": ["finesse"],
    "mastery": "vex"
  },
  "itemable_id": "c886bdcc-7120-4f16-8367-259396766cc1",
  "itemable_type": "Feat"
}

Dnd5::Item.create!(json)

Dir[File.join(Rails.root.join('db/data/fallout/weapons.json'))].each do |filename|
  puts "seeding - #{filename}"
  weapons = JSON.parse(File.read(filename))
  Fallout::Item.upsert_all(weapons) if weapons.any?
end

weapons_file = File.read(Rails.root.join('db/data/fallout/weapons/*.json'))
weapons = JSON.parse(weapons_file)
Dc20::Item.upsert_all(weapons) if weapons.any?

weapons_file = File.read(Rails.root.join('db/data/dc20/weapons.json'))
weapons = JSON.parse(weapons_file)
Dc20::Item.upsert_all(weapons) if weapons.any?

armor_file = File.read(Rails.root.join('db/data/dc20/armor.json'))
armor = JSON.parse(armor_file)
Dc20::Item.upsert_all(armor) if armor.any?

shield_file = File.read(Rails.root.join('db/data/dc20/shield.json'))
shield = JSON.parse(shield_file)
Dc20::Item.upsert_all(shield) if shield.any?

weapons_file = File.read(Rails.root.join('db/data/dnd5/weapons.json'))
weapons = JSON.parse(weapons_file)
Dnd5::Item.upsert_all(weapons) if weapons.any?

armor_file = File.read(Rails.root.join('db/data/dnd5/armor.json'))
armor = JSON.parse(armor_file)
Dnd5::Item.upsert_all(armor) if armor.any?

armor_file = File.read(Rails.root.join('db/data/daggerheart/armor.json'))
armor = JSON.parse(armor_file)
Daggerheart::Item.upsert_all(armor) if armor.any?

weapons_file = File.read(Rails.root.join('db/data/daggerheart/weapons.json'))
weapons = JSON.parse(weapons_file)
Daggerheart::Item.upsert_all(weapons) if weapons.any?

spells_file = File.read(Rails.root.join('db/data/daggerheart/domain_cards.json'))
spells = JSON.parse(spells_file)
Daggerheart::Spell.upsert_all(spells) if spells.any?

armor_file = File.read(Rails.root.join('db/data/pathfinder2/armor.json'))
armor = JSON.parse(armor_file)
Pathfinder2::Item.upsert_all(armor) if armor.any?

weapons_file = File.read(Rails.root.join('db/data/pathfinder2/weapons.json'))
weapons = JSON.parse(weapons_file)
Pathfinder2::Item.upsert_all(weapons) if weapons.any?

user = User.create! locale: 'ru', password: SecureRandom.alphanumeric(24)
user.sessions.create!

Item::Recipe.create(
  tool: Dnd5::Item.find_by(slug: 'herbalism'),
  item: Dnd5::Item.find_by(slug: 'potion_healing'),
  info: { output_per_day: 1 }
)

client = HttpService::Client.new(url: 'https://sb.dccrit.com')
response = client.post(path: 'rest/v1/rpc/get_spell_list_v3', body: { p_per_page: 50, p_page: 3, p_sort_asc: true, p_sort_by: 'name' }, headers: { 'apiKey' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudnNkcXBieXVqcGZnaGdhcGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1NTI2MjAsImV4cCI6MjA0MzEyODYyMH0.2stuMtZD0DcrX3pbIjKTMV3pJ0rRGrP0aJvS6bydG9U', 'Accept-Encoding' => 'identity' })

def formatted_price(item)
  price = item['cost'].except('mana')
  if item['cost']['mana']
    price['mp'] = item['cost']['mana'] if item['cost']['mana'].positive?
    price['mp'] = nil if item['cost']['mana'].negative?
  end
  price
end

def formatted_range(item)
  return 0 if item['range'] == 'Self'

  item['range'].split(' ')[0].to_i
end

def formatted_duration(item)
  return 'instant' if item['duration'] == 'Instantaneous'

  value = item['duration'].split(' ')[0]
  return "#{value},m" if item['duration'].include?('Minute')
  return "#{value},h" if item['duration'].include?('Hour')
end

def sustained(item)
  item['duration'].include?('Sustained')
end

def enhancements(item)
  item['enhancements']&.map do |enh|
    {
      name: { "en": enh['name'], "ru": enh['name'] },
      price: formatted_price(enh),
      sustained: enh['sustained'],
      repeatable: enh['repeatable'],
      description: { "en": enh['desc'], "ru": enh['desc'] }
    }
  end
end

data_hash = response['list'].filter_map do |data|
  item = data['data']
  next unless item['official']

  {
    slug: item['name'].underscore.gsub(' ', '_'),
    kind: 'static',
    title: { en: item['name'], ru: item['name'] },
    description: { en: item['desc'], ru: item['desc'] },
    origin: 'spell',
    origin_value: item['sources'].join(','),
    origin_values: item['tags'],
    price: formatted_price(item),
    triggers: item['triggers'],
    reactions: item['reactions'],
    passive: item['passive'],
    info: {
      school: item['schools'][0],
      range: formatted_range(item),
      duration: formatted_duration(item),
      sustained: sustained(item),
      enhancements: enhancements(item)
    }.compact
  }
end

beautified_json_string = JSON.pretty_generate(data_hash)
# # Write the beautified JSON string to a file
File.open('db/data/dc20/spells_3.json', 'w') do |file|
  file.write(beautified_json_string)
end


client = HttpService::Client.new(url: 'https://sb.dccrit.com')
response = client.post(path: 'rest/v1/rpc/get_maneuver_list_v3', body: { p_per_page: 50, p_page: 1, p_sort_asc: true, p_sort_by: 'name' }, headers: { 'apiKey' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudnNkcXBieXVqcGZnaGdhcGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1NTI2MjAsImV4cCI6MjA0MzEyODYyMH0.2stuMtZD0DcrX3pbIjKTMV3pJ0rRGrP0aJvS6bydG9U', 'Accept-Encoding' => 'identity' })


def enhancements(item)
  item['enhancements']&.map do |enh|
    {
      name: { "en": enh['name'], "ru": enh['name'] },
      price: enh['cost'],
      repeatable: enh['repeatable'],
      description: { "en": enh['desc'], "ru": enh['desc'] }
    }
  end
end

data_hash = response['list'].filter_map do |data|
  item = data['data']
  next unless item['official']

  description = item['desc']
  description = "#{description}\n\n**Trigger:** #{item['trigger']}" if item['trigger']
  description = "#{description}\n\n**Reaction:** #{item['reaction']}" if item['reaction']

  {
    slug: item['name'].underscore.gsub(' ', '_'),
    kind: 'static',
    title: { en: item['name'], ru: item['name'] },
    description: { en: description, ru: description },
    origin: 'maneuver',
    price: item['cost'],
    origin_value: item['type'].split(' ')[0].underscore,
    
    info: {
      range: { en: item['range'], ru: item['range'] },
      enhancements: enhancements(item)
    }.compact
  }
end

beautified_json_string = JSON.pretty_generate(data_hash)
# # Write the beautified JSON string to a file
File.open('db/data/dc20/maneuvers.json', 'w') do |file|
  file.write(beautified_json_string)
end

