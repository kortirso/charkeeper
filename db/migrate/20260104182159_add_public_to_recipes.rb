class AddPublicToRecipes < ActiveRecord::Migration[8.1]
  def change
    add_column :item_recipes, :public, :boolean, default: false
  end
end
