class CreateCampaignItems < ActiveRecord::Migration[8.1]
  def change
    create_table :campaign_items, id: :uuid do |t|
      t.uuid :campaign_id, null: false
      t.uuid :item_id, null: false
      t.string :name
      t.text :notes
      t.jsonb :states, null: false, default: {}
      t.jsonb :modifiers, null: false, default: {}
      t.timestamps
    end
    add_index :campaign_items, [:campaign_id, :item_id]
  end
end
