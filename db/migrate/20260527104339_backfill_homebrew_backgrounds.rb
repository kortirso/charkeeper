class BackfillHomebrewBackgrounds < ActiveRecord::Migration[8.1]
  def up
    ::Homebrew::Community.find_each do |object|
      object.data['names'] = { en: object.name, ru: object.name, es: object.name }
      object.save
    end
  end

  def down; end
end
