class BackfillDataForDhAncestries < ActiveRecord::Migration[8.1]
  def up
    Daggerheart::Homebrew::Race.find_each do |item|
      new_item = ::Daggerheart::Homebrews::Ancestry.create(
        id: item.id,
        user_id: item.user_id,
        title: { en: item.name, ru: item.name },
        public: item.public,
        discarded_at: item.discarded_at,
        description: {}
      )

      item.homebrew_book_items.update_all(itemable_type: 'Daggerheart::Homebrews::Ancestry', itemable_id: new_item.id)
    end
  end

  def down; end
end
