class BackfillDhFeats < ActiveRecord::Migration[8.1]
  def up
    Daggerheart::Feat.find_by(slug: 'aquatic', origin_value: 'aquatic_scout')&.update(slug: 'aquatic_scout')
    Daggerheart::Feat.find_by(slug: 'bird_eye_view', origin_value: 'great_winged_beast')&.update(slug: 'great_bird_eye_view')
    Daggerheart::Feat.find_by(slug: 'carrier', origin_value: 'great_predator')&.update(slug: 'great_carrier')
    Daggerheart::Feat.find_by(slug: 'frenzy', origin_value: 'blade')&.update(slug: 'blade_frenzy')
    Daggerheart::Feat.find_by(slug: 'amphibious', origin_value: 'ribbet')&.update(slug: 'ribbet_amphibious')

    file_content = File.read('db/data_prod/daggerheart/feats.json')
    JSON.parse(file_content).each do |item|
      feat = Daggerheart::Feat.find_by(slug: item['slug'])
      next unless feat

      feat.update!(item.slice('description', 'kind', 'limit_refresh', 'description_eval_variables', 'eval_variables', 'continious', 'bonus_eval_variables', 'price', 'modifiers', 'tokens'))
    end

    Daggerheart::Feat.where.not(tokens: nil).find_each do |item|
      item.character_feats.where(tokens: nil).update_all(tokens: 0)
    end
  end

  def down; end
end
