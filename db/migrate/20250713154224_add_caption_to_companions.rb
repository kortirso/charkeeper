class AddCaptionToCompanions < ActiveRecord::Migration[8.0]
  def change
    add_column :character_companions, :caption, :text
  end
end
