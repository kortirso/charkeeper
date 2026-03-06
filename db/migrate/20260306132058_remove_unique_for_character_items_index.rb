class RemoveUniqueForCharacterItemsIndex < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    safety_assured do
      remove_index :character_items, [:character_id, :item_id]
      add_index :character_items, [:character_id, :item_id], algorithm: :concurrently
    end
  end

  def down
    safety_assured do
      remove_index :character_items, [:character_id, :item_id]
      add_index :character_items, [:character_id, :item_id], unique: true, algorithm: :concurrently
    end
  end
end
