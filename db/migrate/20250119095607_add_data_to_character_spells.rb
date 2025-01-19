class AddDataToCharacterSpells < ActiveRecord::Migration[8.0]
  def change
    add_column :character_spells, :data, :jsonb, null: false, default: {}
  end
end
