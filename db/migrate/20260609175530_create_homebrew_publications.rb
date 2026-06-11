class CreateHomebrewPublications < ActiveRecord::Migration[8.1]
  def change
    create_table :homebrew_publications, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.string :parent_type, null: false
      t.timestamps
    end
    add_index :homebrew_publications, :user_id
  end
end
