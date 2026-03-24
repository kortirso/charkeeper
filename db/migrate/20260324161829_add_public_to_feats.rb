class AddPublicToFeats < ActiveRecord::Migration[8.1]
  def change
    add_column :feats, :public, :boolean, default: false
  end
end
