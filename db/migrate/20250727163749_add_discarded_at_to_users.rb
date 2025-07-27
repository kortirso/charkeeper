class AddDiscardedAtToUsers < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_column :users, :discarded_at, :datetime
    add_index :users, :discarded_at, algorithm: :concurrently
  end
end
