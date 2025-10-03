class CreateUserBooks < ActiveRecord::Migration[8.0]
  def change
    create_table :user_books, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.uuid :homebrew_book_id, null: false
      t.timestamps
    end
    add_index :user_books, [:user_id, :homebrew_book_id], unique: true
  end
end
