class CreateUserPlatforms < ActiveRecord::Migration[8.0]
  def change
    create_table :user_platforms, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.string :name, null: false
      t.timestamps
    end
    add_index :user_platforms, [:user_id, :name], unique: true
  end
end
