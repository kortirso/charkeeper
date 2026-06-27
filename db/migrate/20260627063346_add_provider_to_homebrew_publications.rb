class AddProviderToHomebrewPublications < ActiveRecord::Migration[8.1]
  def change
    add_column :homebrew_publications, :provider, :string
  end
end
