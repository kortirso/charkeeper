class AddEvalVariablesToDaggerheartFeatures < ActiveRecord::Migration[8.0]
  def change
    add_column :daggerheart_character_features, :eval_variables, :jsonb, null: false, default: {}
  end
end
