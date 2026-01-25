class CreateCampaignNotes < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    create_table :campaign_notes, id: :uuid do |t|
      t.uuid :campaign_id, null: false
      t.string :title, null: false
      t.text :value, null: false
      t.timestamps
    end

    add_index :campaign_notes, :campaign_id, algorithm: :concurrently
    add_index :character_notes, :character_id, algorithm: :concurrently
  end
end
