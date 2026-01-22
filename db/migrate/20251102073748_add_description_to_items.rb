class AddDescriptionToItems < ActiveRecord::Migration[8.1]
  def change
    add_column :items, :description, :jsonb, default: { en: '', ru: '' }

    # Item.update_all(description: { en: '', ru: '' })

    safety_assured { change_column_null :items, :description, false }
  end
end
