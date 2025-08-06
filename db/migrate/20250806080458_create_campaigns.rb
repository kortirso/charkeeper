class CreateCampaigns < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    create_table :campaigns, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.string :name, null: false
      t.timestamps
    end
    add_index :campaigns, :user_id, algorithm: :concurrently

    create_table :campaign_characters, id: :uuid do |t|
      t.uuid :campaign_id, null: false
      t.uuid :character_id, null: false
      t.timestamps
    end
    add_index :campaign_characters, [:campaign_id, :character_id], unique: true, algorithm: :concurrently
  end
end
