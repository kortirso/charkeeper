class AddProviderToCampaigns < ActiveRecord::Migration[8.0]
  def change
    add_column :campaigns, :type, :string, null: false
  end
end
