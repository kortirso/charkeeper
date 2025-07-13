class CreateCharacterCompanions < ActiveRecord::Migration[8.0]
  def change
    create_table :character_companions, id: :uuid do |t|
      t.string :type, null: false
      t.string :name, null: false
      t.uuid :character_id, null: false
      t.jsonb :data, null: false, default: {}
      t.timestamps
    end
  end
end
