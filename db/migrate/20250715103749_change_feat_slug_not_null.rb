class ChangeFeatSlugNotNull < ActiveRecord::Migration[8.0]
  def change
    safety_assured { change_column_null :feats, :slug, true }
  end
end
