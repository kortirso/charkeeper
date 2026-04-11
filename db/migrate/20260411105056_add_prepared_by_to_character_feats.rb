class AddPreparedByToCharacterFeats < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    add_column :character_feats, :prepared_by, :string
    safety_assured do
      remove_index :character_feats, [:character_id, :feat_id, :kind]
      add_index :character_feats, [:character_id, :feat_id, :kind, :prepared_by], unique: true, algorithm: :concurrently
    end
  end

  def down
    remove_index :character_feats, [:character_id, :feat_id, :kind, :prepared_by]
    remove_column :character_feats, :prepared_by

    add_index :character_feats, [:character_id, :feat_id, :kind], unique: true, algorithm: :concurrently
  end
end
