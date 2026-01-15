class AddNameJsonToTransformations < ActiveRecord::Migration[8.1]
  def change
    add_column :daggerheart_homebrew_transformations, :name_json, :jsonb, null: false, default: {}
  end
end
