class AddExcludeToDnd2024CharacterFeatures < ActiveRecord::Migration[8.0]
  def change
    add_column :dnd2024_character_features, :exclude, :string, array: true
  end
end
