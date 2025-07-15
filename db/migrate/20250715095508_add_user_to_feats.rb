class AddUserToFeats < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_column :feats, :user_id, :uuid
    add_index :feats, :user_id, algorithm: :concurrently
  end
end
