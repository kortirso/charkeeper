class CreateChannels < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    create_table :channels, id: :uuid do |t|
      t.integer :provider, null: false, limit: 2
      t.string :external_id, null: false
      t.timestamps
    end

    create_table :campaign_channels, id: :uuid do |t|
      t.uuid :campaign_id, null: false
      t.uuid :channel_id, null: false
      t.timestamps
    end

    add_index :campaign_channels, :campaign_id, algorithm: :concurrently
    add_index :campaign_channels, :channel_id, unique: true, algorithm: :concurrently
  end
end
