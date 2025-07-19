class ChangeIndexCharacterSpells < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def up
    remove_index :character_spells, [:character_id, :spell_id]

    add_index :character_spells, [:character_id, :spell_id], algorithm: :concurrently
  end

  def down
    remove_index :character_spells, [:character_id, :spell_id]

    add_index :character_spells, [:character_id, :spell_id], unique: true, algorithm: :concurrently
  end
end
