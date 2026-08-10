class AddParentToCharacters < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_column :characters, :parent_id, :uuid
    add_index :characters, :parent_id, where: 'parent_id IS NOT NULL', algorithm: :concurrently
  end
end
