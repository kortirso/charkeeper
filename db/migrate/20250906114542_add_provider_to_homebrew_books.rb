class AddProviderToHomebrewBooks < ActiveRecord::Migration[8.0]
  def change
    add_column :homebrew_books, :provider, :string, null: false
  end
end
