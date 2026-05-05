class CreateCustomResources < ActiveRecord::Migration[8.1]
  def change
    create_table :custom_resources, id: :uuid do |t|
      t.uuid :resourceable_id, null: false
      t.string :resourceable_type, null: false
      t.string :name, null: false
      t.text :description
      t.integer :max_value, null: false, default: 1
      t.jsonb :resets, null: false, default: {}
      t.timestamps
    end
  end
end
