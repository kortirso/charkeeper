class CreateItemRecipes < ActiveRecord::Migration[8.1]
  def change
    create_table :item_recipes, id: :uuid do |t|
      t.uuid :tool_id, null: false
      t.uuid :item_id, null: false
      t.jsonb :info, null: false, default: {}
      t.timestamps
    end
    add_index :item_recipes, [:tool_id, :item_id], unique: true
  end
end
