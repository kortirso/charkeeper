class AddDescriptionEvalVariablesToDnd5Features < ActiveRecord::Migration[8.0]
  def change
    add_column :dnd5_character_features, :description_eval_variables, :jsonb, null: false, default: {}
    add_column :dnd2024_character_features, :description_eval_variables, :jsonb, null: false, default: {}
  end
end
