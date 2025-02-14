class AddChooseOnceForFeatures < ActiveRecord::Migration[8.0]
  def change
    add_column :dnd5_character_features, :choose_once, :boolean, null: false, default: false
    add_column :dnd2024_character_features, :choose_once, :boolean, null: false, default: false
  end
end
