class AddSharedToHomebrewBooks < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_column :homebrew_books, :shared, :boolean
    add_index :homebrew_books, :shared, where: 'shared IS NOT NULL', algorithm: :concurrently
  end
end
