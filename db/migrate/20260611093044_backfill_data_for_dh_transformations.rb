class BackfillDataForDhTransformations < ActiveRecord::Migration[8.1]
  def up
    Daggerheart::Homebrew::Transformation.find_each do |item|
      new_item = ::Daggerheart::Homebrews::Transformation.create(
        id: item.id,
        user_id: item.user_id,
        title: item.name_json,
        public: item.public,
        description: {}
      )

      item.homebrew_book_items.update_all(itemable_type: 'Daggerheart::Homebrews::Transformation', itemable_id: new_item.id)
    end
  end

  def down; end
end
