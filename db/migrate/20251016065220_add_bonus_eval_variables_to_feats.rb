class AddBonusEvalVariablesToFeats < ActiveRecord::Migration[8.0]
  def change
    add_column :feats, :bonus_eval_variables, :jsonb
  end
end
