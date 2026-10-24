class AddPositionToCharacters < ActiveRecord::Migration[8.1]
  def change
    add_column :characters, :position, :integer, comment: 'Позиция персонажа в сортированном списке юзера'
  end
end
