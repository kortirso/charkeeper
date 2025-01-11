class CreateUserSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :user_sessions, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.timestamps
    end
    add_index :user_sessions, :user_id
  end
end
