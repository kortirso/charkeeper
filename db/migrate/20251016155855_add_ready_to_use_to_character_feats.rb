class AddReadyToUseToCharacterFeats < ActiveRecord::Migration[8.0]
  def change
    add_column :character_feats, :ready_to_use, :boolean
  end
end
