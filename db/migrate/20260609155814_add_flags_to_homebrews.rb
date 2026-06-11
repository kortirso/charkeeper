class AddFlagsToHomebrews < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_column :homebrews, :public, :boolean, null: false, default: false

    add_column :homebrews, :discarded_at, :datetime
    add_index :homebrews, :discarded_at, algorithm: :concurrently
  end
end
