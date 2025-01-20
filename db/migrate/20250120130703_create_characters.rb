class CreateCharacters < ActiveRecord::Migration[8.0]
  def change
    create_table :user_characters, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.uuid :characterable_id, null: false
      t.string :characterable_type, null: false
      t.integer :provider, null: false, default: 0
      t.timestamps
    end
    add_index :user_characters, :user_id
    add_index :user_characters, [:characterable_id, :characterable_type]
  end
end
