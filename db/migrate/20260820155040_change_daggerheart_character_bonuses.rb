class ChangeDaggerheartCharacterBonuses < ActiveRecord::Migration[8.1]
  def up
    Character::Bonus.where(bonusable_id: Character.daggerheart.select(:id)).find_each do |item|
      modifiers = {}
      item.value['thresholds']&.each do |key, value|
        modifiers["damage_thresholds.#{key}"] = { type: 'add', value: value }
      end
      item.value['traits']&.each do |key, value|
        modifiers[key] = { type: 'add', value: value }
      end
      modifiers['evasion'] = { type: 'add', value: item.value['evasion'] } if item.value['evasion']
      modifiers['attack'] = { type: 'add', value: item.value['attack'] } if item.value['attack']
      modifiers['armor_score'] = { type: 'add', value: item.value['armor_score'] } if item.value['armor_score']
      modifiers['health_max'] = { type: 'add', value: item.value['health'] } if item.value['health']
      modifiers['stress_max'] = { type: 'add', value: item.value['stress'] } if item.value['stress']
      modifiers['hope_max'] = { type: 'add', value: item.value['hope'] } if item.value['hope']

      item.value = modifiers
      item.save
    end
  end

  def down; end
end
