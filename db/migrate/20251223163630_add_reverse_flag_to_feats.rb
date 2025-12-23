class AddReverseFlagToFeats < ActiveRecord::Migration[8.1]
  def change
    add_column :feats, :reverse_refresh, :boolean, default: false
  end
end
