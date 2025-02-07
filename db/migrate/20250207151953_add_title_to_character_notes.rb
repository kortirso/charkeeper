class AddTitleToCharacterNotes < ActiveRecord::Migration[8.0]
  def change
    add_column :character_notes, :title, :string, null: false
  end
end
