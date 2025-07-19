class AddUserIdToItems < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_column :items, :user_id, :uuid
    add_index :items, :user_id, algorithm: :concurrently
  end
end
