class AddDiscardedFields < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_column :homebrew_communities, :discarded_at, :datetime
    add_index :homebrew_communities, :discarded_at, algorithm: :concurrently

    add_column :homebrew_races, :discarded_at, :datetime
    add_index :homebrew_races, :discarded_at, algorithm: :concurrently

    add_column :homebrew_specialities, :discarded_at, :datetime
    add_index :homebrew_specialities, :discarded_at, algorithm: :concurrently

    add_column :homebrew_subclasses, :discarded_at, :datetime
    add_index :homebrew_subclasses, :discarded_at, algorithm: :concurrently
  end
end
