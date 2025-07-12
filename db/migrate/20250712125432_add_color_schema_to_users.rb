class AddColorSchemaToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :color_schema, :integer
  end
end
