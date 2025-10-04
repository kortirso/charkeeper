class CreateHomebrewTransformations < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    create_table :daggerheart_homebrew_transformations, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.string :name, null: false
      t.timestamps
    end
    add_index :daggerheart_homebrew_transformations, :user_id, algorithm: :concurrently
  end
end
