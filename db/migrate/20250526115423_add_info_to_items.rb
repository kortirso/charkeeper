class AddInfoToItems < ActiveRecord::Migration[8.0]
  def change
    add_column :items, :info, :jsonb, null: false, default: {}
  end
end
