class CreateUserNotifications < ActiveRecord::Migration[8.0]
  def change
    create_table :user_notifications, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.boolean :read, null: false, default: false
      t.string :title, null: false
      t.text :value, null: false
      t.timestamps
    end
    add_index :user_notifications, :user_id
  end
end
