class ChanegDnd2024Feats < ActiveRecord::Migration[8.1]
  def up
    feats = JSON.parse(File.read('db/data/dnd2024/feats.json'))
    feats.each do |feat|
      item = ::Dnd2024::Feat.find_by(id: feat['id']) || ::Dnd2024::Feat.find_by(slug: feat['slug'])
      next unless item

      item.update!(
        eval_variables: feat['eval_variables'],
        bonus_eval_variables: feat['bonus_eval_variables'],
        description_eval_variables: feat['description_eval_variables'],
        modifiers: feat['modifiers'] || {}
      )
    end
  end

  def down; end
end
