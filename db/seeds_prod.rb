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

[
  'feats_singer.json', 'feats_path.json', 'feats_actions.json',
  'feats_agent.json', 'feats_envoy.json', 'feats_hunter.json', 'feats_leader.json',
  'feats_abrasion.json', 'feats_adhesion.json', 'feats_cohesion.json', 'feats_division.json', 'feats_gravitation.json',
  'feats_illumination.json', 'feats_progression.json', 'feats_tension.json', 'feats_transformation.json',
  'feats_transportation.json',
  'feats_dustbringer.json', 'feats_edgedancer.json', 'feats_elsecaller.json', 'feats_lightweaver.json', 'feats_skybreaker.json',
  'feats_stoneward.json', 'feats_truthwatcher.json', 'feats_willshaper.json', 'feats_windrunner.json'
].each do |filename|
  JSON.parse(File.read("db/data_prod/cosmere/#{filename}")).each do |item|
    feat = ::Cosmere::Feat.find_by(slug: item['slug'])
    feat ? feat.update!(item) : ::Cosmere::Feat.create!(item)
  end
end

['weapon.json', 'armor.json', 'items.json'].each do |filename|
  JSON.parse(File.read("db/data_prod/cosmere/#{filename}")).each do |data|
    item = ::Cosmere::Item.find_by(slug: data['slug'])
    item ? item.update!(data) : ::Cosmere::Item.create!(data)
  end
end
