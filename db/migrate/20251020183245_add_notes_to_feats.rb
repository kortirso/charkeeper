class AddNotesToFeats < ActiveRecord::Migration[8.0]
  def change
    add_column :character_feats, :notes, :text
  end
end
