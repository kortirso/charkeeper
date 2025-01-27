class CreateCharacterSpells < ActiveRecord::Migration[8.0]
  def change
    create_table :character_spells, id: :uuid do |t|
      t.uuid :character_id, null: false
      t.uuid :spell_id, null: false
      t.jsonb :data, null: false, default: {}, comment: 'Свойства подготовленных заклинания'
      t.timestamps
    end
    add_index :character_spells, [:character_id, :spell_id], unique: true
  end
end
