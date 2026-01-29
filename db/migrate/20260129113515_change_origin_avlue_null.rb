class ChangeOriginAvlueNull < ActiveRecord::Migration[8.1]
  def change
    change_column_null :feats, :origin_value, true
  end
end
