class AddDataToHomebrewCommunities < ActiveRecord::Migration[8.1]
  def change
    add_column :homebrew_communities, :data, :jsonb, null: false, default: {}
  end
end
