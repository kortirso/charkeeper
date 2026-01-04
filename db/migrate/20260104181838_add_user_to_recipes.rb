class AddUserToRecipes < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_column :item_recipes, :user_id, :uuid
    add_index :item_recipes, :user_id, algorithm: :concurrently
  end
end
