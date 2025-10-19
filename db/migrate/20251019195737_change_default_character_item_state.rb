class ChangeDefaultCharacterItemState < ActiveRecord::Migration[8.0]
  def change
    change_column_default :character_items, :state, from: 1, to: 2
  end
end
