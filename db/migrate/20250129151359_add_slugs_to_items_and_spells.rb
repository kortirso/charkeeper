class AddSlugsToItemsAndSpells < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_column :items, :slug, :string, null: false
    add_index :items, :slug, algorithm: :concurrently
    add_column :spells, :slug, :string, null: false
    add_index :spells, :slug, algorithm: :concurrently
  end
end
