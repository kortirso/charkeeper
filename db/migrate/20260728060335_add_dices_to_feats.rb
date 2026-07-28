class AddDicesToFeats < ActiveRecord::Migration[8.1]
  def change
    add_column :feats, :dices, :jsonb, comment: 'Настройки дайсов'
    add_column :character_feats, :dices, :jsonb, comment: 'Текущие значения дайсов'
  end
end
