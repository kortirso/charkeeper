class CreateUsers < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    create_table :users, id: :uuid do |t|
      t.timestamps
    end

    add_column :characters, :user_id, :uuid, null: false
    add_index :characters, :user_id, algorithm: :concurrently
  end
end
