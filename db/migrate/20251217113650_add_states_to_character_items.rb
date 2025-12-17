class AddStatesToCharacterItems < ActiveRecord::Migration[8.1]
  def up
    add_column :character_items, :states, :jsonb, null: false, default: {}
  end
end
