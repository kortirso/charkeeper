Dir[File.join(Rails.root.join('db/data_prod/pathfinder2/*.json'))].each do |filename|
  puts "seeding - #{filename}"
  JSON.parse(File.read(filename)).each do |item|
    feat = ::Pathfinder2::Feat.find_by(slug: item['slug'])
    feat ? feat.update!(item) : ::Pathfinder2::Feat.create!(item)
  end
end
