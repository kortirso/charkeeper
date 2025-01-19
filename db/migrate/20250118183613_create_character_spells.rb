class CreateCharacterSpells < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    create_table :character_spells, id: :uuid do |t|
      t.uuid :character_id, null: false
      t.uuid :spell_id, null: false
      t.boolean :ready_to_use, null: false, default: false
      t.timestamps
    end
    add_index :character_spells, [:character_id, :spell_id], unique: true
    add_index :spells, :rule_id, algorithm: :concurrently
  end
end
