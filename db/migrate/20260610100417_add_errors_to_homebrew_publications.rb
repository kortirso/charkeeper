class AddErrorsToHomebrewPublications < ActiveRecord::Migration[8.1]
  def change
    add_column :homebrew_publications, :errors_list, :jsonb, null: false, default: {}
    add_column :homebrew_publications, :completed_at, :datetime
  end
end
