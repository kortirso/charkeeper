class AddTokensToFeats < ActiveRecord::Migration[8.1]
  def change
    add_column :feats, :tokens, :jsonb, comment: 'Настройки токенов для навыков'
    add_column :character_feats, :tokens, :integer, comment: 'Текущее кол-во токенов'
  end
end
