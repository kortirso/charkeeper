class CreateCharacterNotes < ActiveRecord::Migration[8.0]
  def change
    create_table :character_notes, id: :uuid do |t|
      t.uuid :character_id, null: false
      t.text :value, null: false
      t.timestamps
    end
  end
end
