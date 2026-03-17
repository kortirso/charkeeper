class AddModifiersToModels < ActiveRecord::Migration[8.1]
  def change
    add_column :characters, :modifiers, :jsonb, null: false, default: {}
    add_column :feats, :modifiers, :jsonb, null: false, default: {}
    add_column :items, :modifiers, :jsonb, null: false, default: {}
  end
end
