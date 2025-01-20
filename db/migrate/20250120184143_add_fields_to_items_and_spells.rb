class AddFieldsToItemsAndSpells < ActiveRecord::Migration[8.0]
  def change
    add_column :dnd5_character_items, :ready_to_use, :boolean, null: false, default: false
    add_column :dnd5_character_spells, :ready_to_use, :boolean, null: false, default: false
    add_column :dnd5_character_spells, :prepared_by, :integer, null: false, limit: 1
  end
end
