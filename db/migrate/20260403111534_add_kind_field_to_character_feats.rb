class AddKindFieldToCharacterFeats < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    add_column :character_feats, :kind, :string, null: false, default: 'default'
    safety_assured do
      remove_index :character_feats, [:character_id, :feat_id]
      add_index :character_feats, [:character_id, :feat_id, :kind], unique: true, algorithm: :concurrently
    end
  end

  def down
    remove_index :character_feats, [:character_id, :feat_id, :kind]
    remove_column :character_feats, :kind

    add_index :character_feats, [:character_id, :feat_id], unique: true, algorithm: :concurrently
  end
end
