class CreateActiveBotObjects < ActiveRecord::Migration[8.0]
  def change
    create_table :active_bot_objects, id: :uuid do |t|
      t.string :source, null: false
      t.string :object, null: false
      t.uuid :user_id, null: false
      t.jsonb :info, null: false, default: {}
      t.timestamps
    end
    add_index :active_bot_objects, [:user_id, :source, :object], unique: true
  end
end
