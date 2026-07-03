class AddDiscardedAtToItems < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_column :items, :discarded_at, :datetime
    add_index :items, :discarded_at, algorithm: :concurrently
  end
end
