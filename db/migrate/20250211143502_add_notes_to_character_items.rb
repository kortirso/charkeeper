class AddNotesToCharacterItems < ActiveRecord::Migration[8.0]
  def change
    add_column :character_items, :notes, :text
  end
end
