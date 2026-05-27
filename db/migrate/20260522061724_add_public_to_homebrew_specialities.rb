class AddPublicToHomebrewSpecialities < ActiveRecord::Migration[8.1]
  def change
    add_column :homebrew_specialities, :public, :boolean, default: false
  end
end
