class CreateDnd5CharacterItems < ActiveRecord::Migration[8.0]
  def change
    create_table :dnd5_character_items, id: :uuid do |t|
      t.uuid :character_id, null: false
      t.uuid :item_id, null: false
      t.integer :quantity, null: false, default: 1
      t.timestamps
    end
    add_index :dnd5_character_items, [:character_id, :item_id], unique: true
  end
end
