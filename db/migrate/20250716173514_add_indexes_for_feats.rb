class AddIndexesForFeats < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_column :feats, :origin_values, :string, array: true, comment: 'Несколько источников, которые могут иметь навык'
    add_index :feats, :origin_values, where: 'origin_values IS NOT NULL', using: :gin, algorithm: :concurrently

    add_index :feats, :origin_value, where: 'origin_value IS NOT NULL', algorithm: :concurrently
  end
end
