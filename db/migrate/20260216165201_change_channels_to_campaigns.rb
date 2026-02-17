class ChangeChannelsToCampaigns < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    add_column :channels, :campaign_id, :uuid
    add_index :channels, :campaign_id, algorithm: :concurrently

    Campaign::Channel.find_each do |campaign_channel|
      channel = Channel.find_by(id: campaign_channel.channel_id)
      next unless channel

      channel.update(campaign_id: campaign_channel.campaign_id)
    end
    Channel.where(campaign_id: nil).destroy_all
  end

  def down
    remove_column :channels, :campaign_id
  end
end
