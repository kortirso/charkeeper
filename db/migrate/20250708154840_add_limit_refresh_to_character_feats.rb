class AddLimitRefreshToCharacterFeats < ActiveRecord::Migration[8.0]
  def change
    safety_assured do
      remove_column :character_feats, :left_count

      add_column :character_feats, :limit_refresh, :integer, limit: 1, comment: 'Событие для обновления лимита'
      add_column :character_feats, :used_count, :integer, comment: 'Кол-во использований'
    end
  end
end
