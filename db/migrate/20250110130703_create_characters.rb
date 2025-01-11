class CreateCharacters < ActiveRecord::Migration[8.0]
  def change
    create_table :characters, id: :uuid do |t|
      t.uuid :rule_id, null: false
      t.string :name, null: false
      t.jsonb :data, null: false, default: {}
      t.timestamps
    end
    add_index :characters, :rule_id
  end
end
