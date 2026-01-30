class AddAdditionalIndexesForFeats < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_index :feats, :type, algorithm: :concurrently
    add_index :feats, :origin, algorithm: :concurrently
    add_index :feats, :slug, where: 'slug IS NOT NULL', algorithm: :concurrently
  end
end
