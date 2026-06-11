class ChangeHomebrewsTable < ActiveRecord::Migration[8.1]
  def up
    safety_assured do
      Homebrew.destroy_all

      remove_index :homebrews, %i[brewery_id brewery_type]
      remove_column :homebrews, :brewery_id
      remove_column :homebrews, :brewery_type
    end

    add_column :homebrews, :title, :jsonb, null: false, default: {}
    add_column :homebrews, :description, :jsonb, null: false, default: {}
    add_column :homebrews, :info, :jsonb, null: false, default: {}
  end

  def down; end
end
