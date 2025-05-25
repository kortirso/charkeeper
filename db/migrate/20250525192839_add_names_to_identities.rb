class AddNamesToIdentities < ActiveRecord::Migration[8.0]
  def change
    add_column :user_identities, :first_name, :string
    add_column :user_identities, :last_name, :string
    add_column :user_identities, :active, :boolean, null: false, default: true
  end
end
