class SetChannelsNullForCampaign < ActiveRecord::Migration[8.1]
  def up
    safety_assured { change_column_null :channels, :campaign_id, true }
  end

  def down
    safety_assured { change_column_null :channels, :campaign_id, false }
  end
end
