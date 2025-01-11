class CreateUserIdentities < ActiveRecord::Migration[8.0]
  def change
    create_table :user_identities, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.integer :provider, null: false
      t.string :uid, null: false
      t.string :username
      t.timestamps
    end
    add_index :user_identities, :user_id
    add_index :user_identities, [:provider, :uid], unique: true
  end
end
