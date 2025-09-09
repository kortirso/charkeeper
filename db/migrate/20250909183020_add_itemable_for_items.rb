class AddItemableForItems < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_column :items, :itemable_id, :uuid
    add_column :items, :itemable_type, :string
    add_index :items, [:itemable_id, :itemable_type], where: 'itemable_id IS NOT NULL AND itemable_type IS NOT NULL', algorithm: :concurrently
  end
end
