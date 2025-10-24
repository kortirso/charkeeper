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

# file_content = File.read('db/data/dnd2024/spells.json')
# data_hash = JSON.parse(file_content)

# classes = { 'Изобретатель' => 'artificer', 'Чародей' => 'sorcerer', 'Волшебник' => 'wizard', 'Бард' => 'bard', 'Друид' => 'druid', 'Колдун' => 'warlock', 'Жрец' => 'cleric', 'Паладин' => 'paladin', 'Следопыт' => 'ranger' }
# schools = { 'Ограждение' => 'abjuration', 'Вызов' => 'conjuration', 'Прорицание' => 'divination', 'Очарование' => 'enchantment', 'Воплощение' => 'evocation', 'Иллюзия' => 'illusion', 'Некромантия' => 'necromancy', 'Преобразование' => 'transmutation' }

# data_hash = data_hash.map do |item|
#   {
#     slug: item['url'],
#     title: { en: item['name']['eng'], ru: item['name']['rus'] },
#     description: {
#       en: '',
#       ru: item['description'].join("\n")
#     },
#     origin: 'spell',
#     origin_values: item['affiliation']['classes'].map { |i| classes[i['name']] },
#     kind: 'static',
#     description_eval_variables: {},
#     eval_variables: {},
#     info: {
#       level: item['level'],
#       school: schools[item['school']],
#       casting_time: item['castingTime'],
#       range: item['range'],
#       duration: item['duration'],
#       components: item['components'],
#       source: item['source']['name']['label']
#     },
#     different: {
#       upper: item['upper']
#     }
#   }
# end

# beautified_json_string = JSON.pretty_generate(data_hash)
# # # Write the beautified JSON string to a file
# File.open('db/data/dnd2024/spells1.json', 'w') do |file|
#   file.write(beautified_json_string)
# end

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

weapons_file = File.read(Rails.root.join('db/data/dc20/weapons.json'))
weapons = JSON.parse(weapons_file)
Dc20::Item.upsert_all(weapons) if weapons.any?

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
