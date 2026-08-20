class UpdateDaggerheartItems < ActiveRecord::Migration[8.1]
  def up
    Daggerheart::Item.where(kind: ['armor', 'primary weapon', 'secondary weapon']).find_each do |item|
      modifiers = {}
      item.info.dig('bonuses', 'thresholds')&.each do |key, value|
        modifiers["thresholds.#{key}"] = { type: 'add', value: value }
      end
      item.info.dig('bonuses', 'traits')&.each do |key, value|
        modifiers[key] = { type: 'add', value: value }
      end
      modifiers['evasion'] = { type: 'add', value: item.info.dig('bonuses', 'evasion') } if item.info.dig('bonuses', 'evasion')
      modifiers['attack'] = { type: 'add', value: item.info.dig('bonuses', 'attack') } if item.info.dig('bonuses', 'attack')
      modifiers['armor_score'] = { type: 'add', value: item.info['base_score'] } if item.info['base_score']
      modifiers['armor_score'] = { type: 'add', value: item.info['armor_score'] } if item.info['armor_score']

      info = item.info.except('bonuses', 'base_score')

      item.update(modifiers: modifiers, info: info)
    end
  end

  def down; end
end
