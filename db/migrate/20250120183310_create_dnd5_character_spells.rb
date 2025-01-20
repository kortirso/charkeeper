class CreateDnd5CharacterSpells < ActiveRecord::Migration[8.0]
  def change
    create_table :dnd5_character_spells, id: :uuid do |t|
      t.uuid :character_id, null: false
      t.uuid :spell_id, null: false
      t.timestamps
    end
    add_index :dnd5_character_spells, [:character_id, :spell_id], unique: true
  end
end
