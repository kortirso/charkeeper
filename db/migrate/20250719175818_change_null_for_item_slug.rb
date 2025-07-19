class ChangeNullForItemSlug < ActiveRecord::Migration[8.0]
  def change
    safety_assured { change_column_null :items, :slug, true }
  end
end
