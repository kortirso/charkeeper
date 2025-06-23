class CreateCharacterBonus < ActiveRecord::Migration[8.0]
  def change
    create_table :character_bonus, id: :uuid do |t|
      t.uuid :character_id, null: false
      t.jsonb :value, null: false, default: {}
      t.string :comment
      t.timestamps
    end
  end
end
