class Change < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    remove_index :upvotes, :user_id, algorithm: :concurrently
    remove_index :upvotes, [:upvoteable_id, :upvoteable_type], algorithm: :concurrently

    add_index :upvotes, [:user_id, :upvoteable_id, :upvoteable_type], algorithm: :concurrently, unique: true
  end

  def down
    remove_index :upvotes, [:user_id, :upvoteable_id, :upvoteable_type], algorithm: :concurrently

    add_index :upvotes, :user_id, algorithm: :concurrently
    add_index :upvotes, [:upvoteable_id, :upvoteable_type], unique: true, algorithm: :concurrently
  end
end
