class CreateHomebrewBooks < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    create_table :homebrew_books, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.string :name, null: false
      t.timestamps
    end
    add_index :homebrew_books, :user_id, algorithm: :concurrently

    create_table :homebrew_book_items, id: :uuid do |t|
      t.uuid :homebrew_book_id, null: false
      t.uuid :itemable_id, null: false
      t.string :itemable_type, null: false
    end
    add_index :homebrew_book_items, :homebrew_book_id, algorithm: :concurrently
    add_index :homebrew_book_items, [:itemable_id, :itemable_type], algorithm: :concurrently
  end
end
