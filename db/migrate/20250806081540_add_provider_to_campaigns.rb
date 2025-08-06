class AddProviderToCampaigns < ActiveRecord::Migration[8.0]
  def change
    add_column :campaigns, :provider, :string, null: false
  end
end
