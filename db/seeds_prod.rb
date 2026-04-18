# Dir[File.join(Rails.root.join('db/data_prod/pathfinder2/*.json'))].each do |filename|
#   puts "seeding - #{filename}"
#   JSON.parse(File.read(filename)).each do |item|
#     feat = ::Pathfinder2::Feat.find_by(slug: item['slug'])
#     feat ? feat.update!(item) : ::Pathfinder2::Feat.create!(item)
#   end
# end

[
  'feats01.json', 'feats02.json', 'feats03.json', 'feats04.json', 'feats05.json', 'feats06.json', 'feats07.json',
  'feats_classes.json', 'feats_pets.json', 'feats_subclasses.json', 'feats_subraces.json', 'feats_races.json',
  'spells0.json', 'spells1.json', 'spells2.json', 'spells3.json'
].each do |filename|
  JSON.parse(File.read("db/data_prod/pathfinder2/#{filename}")).each do |item|
    feat = ::Pathfinder2::Feat.find_by(slug: item['slug'])
    feat ? feat.update!(item) : ::Pathfinder2::Feat.create!(item)
  end
end

['weapon.json', 'armor.json', 'shields.json'].each do |filename|
  JSON.parse(File.read("db/data_prod/pathfinder2/#{filename}")).each do |data|
    item = ::Pathfinder2::Item.find_by(slug: data['slug'])
    item ? item.update!(data) : ::Pathfinder2::Item.create!(data)
  end
end
