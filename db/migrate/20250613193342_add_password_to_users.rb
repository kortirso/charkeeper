class AddPasswordToUsers < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_column :users, :password_digest, :string
    add_column :users, :username, :string
    add_index :users, :username, where: 'username IS NOT NULL', unique: true, algorithm: :concurrently
  end
end
