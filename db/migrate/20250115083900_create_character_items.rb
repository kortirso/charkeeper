class CreateCharacterItems < ActiveRecord::Migration[8.0]
  def change
    create_table :character_items, id: :uuid do |t|
      t.uuid :character_id, null: false
      t.uuid :item_id, null: false
      t.integer :quantity, null: false, default: 1
      t.boolean :ready_to_use, null: false, default: false
      t.jsonb :data, null: false, default: {}
      t.timestamps
    end
    add_index :character_items, [:character_id, :item_id], unique: true
  end
end
