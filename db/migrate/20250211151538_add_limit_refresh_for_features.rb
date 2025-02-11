class AddLimitRefreshForFeatures < ActiveRecord::Migration[8.0]
  def change
    add_column :dnd5_character_features, :limit_refresh, :integer, limit: 1
  end
end
