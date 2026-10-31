class CreateCharacterFormulas < ActiveRecord::Migration[8.1]
  def change
    create_table :character_formulas, id: :uuid do |t|
      t.uuid :character_id, null: false
      t.uuid :item_id, null: false
      t.timestamps
    end
    add_index :character_formulas, [:character_id, :item_id], unique: true
  end
end
