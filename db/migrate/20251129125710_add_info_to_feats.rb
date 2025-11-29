class AddInfoToFeats < ActiveRecord::Migration[8.1]
  def change
    add_column :feats, :info, :jsonb, null: false, default: {}
  end
end
