class AddRussianLoginToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :russian_login, :boolean, null: false, default: false
  end
end
