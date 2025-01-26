class AddClassNameToDnd5Characters < ActiveRecord::Migration[8.0]
  def change
    add_column :dnd5_characters, :main_class, :integer, limit: 1, null: false, comment: 'Первый выбранный класс'
  end
end
