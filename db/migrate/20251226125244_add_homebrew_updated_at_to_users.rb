class AddHomebrewUpdatedAtToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :homebrew_updated_at, :datetime
  end
end
