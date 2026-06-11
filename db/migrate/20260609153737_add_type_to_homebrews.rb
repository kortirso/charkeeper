class AddTypeToHomebrews < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_column :homebrews, :type, :string, null: false
    add_index :homebrews, :type, algorithm: :concurrently
  end
end
