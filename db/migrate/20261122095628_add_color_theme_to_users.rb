class AddColorThemeToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :color_theme, :string, default: 'crimson'
  end
end
