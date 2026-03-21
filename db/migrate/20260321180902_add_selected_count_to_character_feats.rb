class AddSelectedCountToCharacterFeats < ActiveRecord::Migration[8.1]
  def change
    add_column :character_feats, :selected_count, :integer
  end
end
