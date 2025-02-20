class AddNotesToCharacterSpells < ActiveRecord::Migration[8.0]
  def change
    add_column :character_spells, :notes, :text
  end
end
